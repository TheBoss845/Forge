"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { projectBlueprintSchema } from "@/features/blueprints/schema";
import { generateFileEdit } from "@/features/generation/ai-edit";
import { generateApplicationFiles } from "@/features/generation/codegen";
import {
  listProjectFiles,
  type ProjectVersionRow,
} from "@/features/generation/queries";
import {
  loadProjectContext,
  type ProjectActionContext,
} from "@/features/projects/server-context";
import { getAiProvider } from "@/lib/ai";
import { recordAiUsage } from "@/lib/ai/usage";
import { trackEvent } from "@/lib/analytics/events";
import { AI_RATE_LIMIT, checkRateLimit } from "@/lib/security/rate-limit";

export interface GenerationActionResult {
  error?: string;
}

const GENERATION_STAGES = [
  "Planning structure",
  "Designing database schema",
  "Building pages and navigation",
  "Writing project files",
  "Saving version snapshot",
] as const;

async function saveVersionSnapshot(
  context: ProjectActionContext,
  description: string,
): Promise<{ error?: string }> {
  const files = await listProjectFiles(context.supabase, context.project.id);

  const { data: latest } = await context.supabase
    .from("project_versions")
    .select("version_number")
    .eq("project_id", context.project.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versionNumber =
    ((latest?.version_number as number | undefined) ?? 0) + 1;

  const { error } = await context.supabase.from("project_versions").insert({
    project_id: context.project.id,
    version_number: versionNumber,
    description,
    snapshot: {
      files: files.map((file) => ({
        path: file.path,
        content: file.content,
        language: file.language ?? "text",
      })),
    },
    created_by: context.userId,
  });

  if (error) {
    console.error("generation: version snapshot failed", error.code);
    return { error: "Could not save the version snapshot." };
  }
  return {};
}

/**
 * Template-based application generation (Phase 2): converts the latest
 * blueprint into a complete starter codebase stored in project_files.
 */
export async function generateApplicationAction(
  projectId: string,
): Promise<GenerationActionResult> {
  const context = await loadProjectContext(projectId);
  if ("error" in context) return context;

  const { supabase, project, userId } = context;

  const { data: blueprintRow } = await supabase
    .from("blueprints")
    .select("*")
    .eq("project_id", project.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!blueprintRow) {
    return {
      error:
        "Generate and approve a blueprint before generating the application.",
    };
  }

  const parsed = projectBlueprintSchema.safeParse(blueprintRow.content);
  if (!parsed.success) {
    return {
      error: "The blueprint could not be read. Create a new version first.",
    };
  }

  const { data: job } = await supabase
    .from("generation_jobs")
    .insert({
      project_id: project.id,
      job_type: "template_generation",
      status: "running",
      progress_stage: GENERATION_STAGES[0],
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  trackEvent("generation_started");

  const failJob = async (message: string) => {
    if (job) {
      await supabase
        .from("generation_jobs")
        .update({
          status: "failed",
          error_message: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }
  };

  let files;
  try {
    files = generateApplicationFiles(parsed.data);
  } catch (error) {
    console.error(
      "generation: codegen failed",
      error instanceof Error ? error.message : "unknown",
    );
    await failJob("Code generation failed.");
    return {
      error:
        "Generation failed before any files were written. Please try again.",
    };
  }

  // Replace previous generated files atomically enough for the MVP:
  // remove old rows, then insert the new set.
  const { error: deleteError } = await supabase
    .from("project_files")
    .delete()
    .eq("project_id", project.id);
  if (deleteError) {
    console.error("generation: clearing old files failed", deleteError.code);
    await failJob("Could not clear previous files.");
    return { error: "Could not start generation. Please try again." };
  }

  const { error: insertError } = await supabase.from("project_files").insert(
    files.map((file) => ({
      project_id: project.id,
      path: file.path,
      content: file.content,
      language: file.language,
      version: 1,
    })),
  );
  if (insertError) {
    console.error("generation: file insert failed", insertError.code);
    await failJob("Could not write generated files.");
    return {
      error: "Generation failed while writing files. Please try again.",
    };
  }

  const snapshot = await saveVersionSnapshot(
    context,
    "Generated application from blueprint",
  );
  if (snapshot.error) {
    await failJob(snapshot.error);
    return { error: snapshot.error };
  }

  if (job) {
    await supabase
      .from("generation_jobs")
      .update({
        status: "completed",
        progress_stage: "Complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
  }

  await supabase
    .from("projects")
    .update({ status: "ready" })
    .eq("id", project.id);

  trackEvent("generation_completed", { files: files.length });
  console.info(
    JSON.stringify({
      type: "generation_job",
      projectId: project.id,
      userId,
      files: files.length,
    }),
  );

  revalidatePath(`/projects/${projectId}/code`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

const editInstructionSchema = z.string().trim().min(5).max(2000);
const filePathSchema = z.string().min(1).max(300);

export interface AiEditActionResult {
  error?: string;
  explanation?: string;
  updatedContent?: string;
}

/** Phase 3: propose an AI edit to one file. Nothing is saved yet. */
export async function proposeFileEditAction(
  projectId: string,
  path: string,
  instruction: string,
): Promise<AiEditActionResult> {
  const parsedPath = filePathSchema.safeParse(path);
  const parsedInstruction = editInstructionSchema.safeParse(instruction);
  if (!parsedPath.success || !parsedInstruction.success) {
    return {
      error: "Describe the change in a sentence (5 to 2000 characters).",
    };
  }

  const context = await loadProjectContext(projectId);
  if ("error" in context) return context;

  const rate = checkRateLimit(`code-edit:${context.userId}`, AI_RATE_LIMIT);
  if (!rate.allowed) {
    return {
      error: `Please wait ${rate.retryAfterSeconds} seconds before requesting another edit.`,
    };
  }

  const provider = getAiProvider();
  if (!provider) {
    return {
      error:
        "AI editing needs an AI provider. The site owner must set AI_PROVIDER, AI_MODEL, and AI_API_KEY.",
    };
  }

  const { data: file } = await context.supabase
    .from("project_files")
    .select("*")
    .eq("project_id", context.project.id)
    .eq("path", parsedPath.data)
    .maybeSingle();
  if (!file) return { error: "File not found." };

  let outcome;
  try {
    outcome = await generateFileEdit(provider, {
      path: parsedPath.data,
      content: file.content as string,
      instruction: parsedInstruction.data,
    });
  } catch (error) {
    console.error(
      "generation: ai edit failed",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      error: "The AI edit failed. The file is unchanged — please try again.",
    };
  }

  for (const result of outcome.usage) {
    await recordAiUsage(context.supabase, {
      organizationId: context.organization.id,
      projectId: context.project.id,
      userId: context.userId,
      operation: "code_edit",
      result,
    });
  }

  return {
    explanation: outcome.edit.explanation,
    updatedContent: outcome.edit.updatedContent,
  };
}

const fileContentSchema = z.string().min(1).max(200_000);

/** Phase 3: apply a reviewed edit, creating a new version snapshot. */
export async function applyFileEditAction(
  projectId: string,
  path: string,
  newContent: string,
  description: string,
): Promise<GenerationActionResult> {
  const parsedPath = filePathSchema.safeParse(path);
  const parsedContent = fileContentSchema.safeParse(newContent);
  if (!parsedPath.success || !parsedContent.success) {
    return { error: "The edited file content is invalid." };
  }

  const context = await loadProjectContext(projectId);
  if ("error" in context) return context;

  const { data: file } = await context.supabase
    .from("project_files")
    .select("id, version")
    .eq("project_id", context.project.id)
    .eq("path", parsedPath.data)
    .maybeSingle();
  if (!file) return { error: "File not found." };

  const { error: updateError } = await context.supabase
    .from("project_files")
    .update({
      content: parsedContent.data,
      version: ((file.version as number) ?? 1) + 1,
    })
    .eq("id", file.id);
  if (updateError) {
    console.error("generation: file update failed", updateError.code);
    return { error: "Could not save the edit. Please try again." };
  }

  const snapshot = await saveVersionSnapshot(
    context,
    description.slice(0, 200) || `Edited ${parsedPath.data}`,
  );
  if (snapshot.error) return { error: snapshot.error };

  revalidatePath(`/projects/${projectId}/code`);
  return {};
}

/** Phase 3: roll the project files back to a saved version snapshot. */
export async function restoreVersionAction(
  projectId: string,
  versionId: string,
): Promise<GenerationActionResult> {
  const context = await loadProjectContext(projectId);
  if ("error" in context) return context;

  const { data: version } = await context.supabase
    .from("project_versions")
    .select("*")
    .eq("id", versionId)
    .eq("project_id", context.project.id)
    .maybeSingle();

  const typedVersion = version as ProjectVersionRow | null;
  if (!typedVersion?.snapshot?.files?.length) {
    return { error: "That version has no file snapshot to restore." };
  }

  const { error: deleteError } = await context.supabase
    .from("project_files")
    .delete()
    .eq("project_id", context.project.id);
  if (deleteError) {
    console.error("generation: restore clear failed", deleteError.code);
    return { error: "Could not restore the version. Please try again." };
  }

  const { error: insertError } = await context.supabase
    .from("project_files")
    .insert(
      typedVersion.snapshot.files.map((file) => ({
        project_id: context.project.id,
        path: file.path,
        content: file.content,
        language: file.language,
        version: 1,
      })),
    );
  if (insertError) {
    console.error("generation: restore insert failed", insertError.code);
    return { error: "Restore failed while writing files. Please try again." };
  }

  const snapshot = await saveVersionSnapshot(
    context,
    `Restored from version ${typedVersion.version_number}`,
  );
  if (snapshot.error) return { error: snapshot.error };

  revalidatePath(`/projects/${projectId}/code`);
  return {};
}

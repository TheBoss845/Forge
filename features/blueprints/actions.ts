"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  BLUEPRINT_SECTIONS,
  projectBlueprintSchema,
  type BlueprintSectionKey,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import {
  applySectionValue,
  getSectionSchema,
} from "@/features/blueprints/sections";
import {
  generateBlueprint,
  reviseBlueprint,
} from "@/features/blueprints/service";
import {
  loadProjectContext,
  type ProjectActionContext,
} from "@/features/projects/server-context";
import { getAiProvider } from "@/lib/ai";
import { recordAiUsage } from "@/lib/ai/usage";
import { trackEvent } from "@/lib/analytics/events";
import { AI_RATE_LIMIT, checkRateLimit } from "@/lib/security/rate-limit";
import type { ChatMessage, CompletionResult } from "@/lib/ai/types";
import type { BlueprintRow, InterviewMessageRow } from "@/types/database";

export interface BlueprintActionResult {
  error?: string;
}

const AI_NOT_CONFIGURED_ERROR =
  "Blueprint generation needs an AI provider. The site owner must set AI_PROVIDER, AI_MODEL, and AI_API_KEY.";

type ActionContext = ProjectActionContext;

const loadContext = loadProjectContext;

async function saveBlueprintVersion(
  context: ActionContext,
  blueprint: ProjectBlueprint,
  summary: string,
): Promise<{ error?: string; blueprintId?: string }> {
  const { supabase, userId, project } = context;

  const { data: latest } = await supabase
    .from("blueprints")
    .select("version_number")
    .eq("project_id", project.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versionNumber =
    ((latest?.version_number as number | undefined) ?? 0) + 1;

  const { data: inserted, error: insertError } = await supabase
    .from("blueprints")
    .insert({
      project_id: project.id,
      version_number: versionNumber,
      title: blueprint.projectName,
      summary,
      content: blueprint,
      status: "draft",
      created_by: userId,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("blueprint: insert failed", insertError?.code);
    return { error: "Could not save the blueprint. Please try again." };
  }

  const { error: projectError } = await supabase
    .from("projects")
    .update({
      status: "blueprint",
      name: blueprint.projectName,
      description: blueprint.oneSentenceSummary,
      active_blueprint_version_id: inserted.id,
    })
    .eq("id", project.id);

  if (projectError) {
    console.error("blueprint: project update failed", projectError.code);
  }

  return { blueprintId: inserted.id as string };
}

async function recordUsage(
  context: ActionContext,
  operation: string,
  usage: CompletionResult[],
): Promise<void> {
  for (const result of usage) {
    await recordAiUsage(context.supabase, {
      organizationId: context.organization.id,
      projectId: context.project.id,
      userId: context.userId,
      operation,
      result,
    });
  }
}

export async function generateBlueprintAction(
  projectId: string,
): Promise<BlueprintActionResult> {
  const context = await loadContext(projectId);
  if ("error" in context) return context;

  const rate = checkRateLimit(`blueprint:${context.userId}`, AI_RATE_LIMIT);
  if (!rate.allowed) {
    return {
      error: `Please wait ${rate.retryAfterSeconds} seconds before generating again.`,
    };
  }

  const provider = getAiProvider();
  if (!provider) return { error: AI_NOT_CONFIGURED_ERROR };

  // Gather the interview transcript for grounding.
  const { data: session } = await context.supabase
    .from("interview_sessions")
    .select("id")
    .eq("project_id", context.project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let transcript: ChatMessage[] = [];
  if (session) {
    const { data: rows } = await context.supabase
      .from("interview_messages")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(200);
    transcript = ((rows ?? []) as InterviewMessageRow[]).map((row) => ({
      role: row.role,
      content: row.content,
    }));
  }

  let outcome;
  try {
    outcome = await generateBlueprint(provider, {
      organization: context.organization,
      project: context.project,
      transcript,
    });
  } catch (error) {
    console.error(
      "blueprint: generation failed",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      error:
        "Blueprint generation failed. Nothing was lost — please try again.",
    };
  }

  await recordUsage(context, "blueprint_generation", outcome.usage);

  const saved = await saveBlueprintVersion(
    context,
    outcome.blueprint,
    "Generated from the discovery interview",
  );
  if (saved.error) return { error: saved.error };

  trackEvent("blueprint_generated");
  revalidatePath(`/projects/${projectId}/blueprint`);
  return {};
}

const revisionInstructionSchema = z.string().trim().min(5).max(2000);

export async function reviseBlueprintAction(
  projectId: string,
  blueprintId: string,
  instruction: string,
): Promise<BlueprintActionResult> {
  const parsedInstruction = revisionInstructionSchema.safeParse(instruction);
  if (!parsedInstruction.success) {
    return {
      error: "Describe the change in a sentence (5 to 2000 characters).",
    };
  }

  const context = await loadContext(projectId);
  if ("error" in context) return context;

  const rate = checkRateLimit(`blueprint:${context.userId}`, AI_RATE_LIMIT);
  if (!rate.allowed) {
    return {
      error: `Please wait ${rate.retryAfterSeconds} seconds before revising again.`,
    };
  }

  const provider = getAiProvider();
  if (!provider) return { error: AI_NOT_CONFIGURED_ERROR };

  const current = await loadBlueprintContent(context, blueprintId);
  if ("error" in current) return current;

  let outcome;
  try {
    outcome = await reviseBlueprint(provider, {
      currentBlueprint: current.blueprint,
      instruction: parsedInstruction.data,
    });
  } catch (error) {
    console.error(
      "blueprint: revision failed",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      error:
        "The revision failed. The current blueprint is unchanged — please try again.",
    };
  }

  await recordUsage(context, "blueprint_revision", outcome.usage);

  const saved = await saveBlueprintVersion(
    context,
    outcome.blueprint,
    `AI revision: ${parsedInstruction.data.slice(0, 120)}`,
  );
  if (saved.error) return { error: saved.error };

  trackEvent("blueprint_edited");
  revalidatePath(`/projects/${projectId}/blueprint`);
  return {};
}

const sectionKeySchema = z.enum(
  BLUEPRINT_SECTIONS.map((section) => section.key) as [
    BlueprintSectionKey,
    ...BlueprintSectionKey[],
  ],
);

export async function updateBlueprintSectionAction(
  projectId: string,
  blueprintId: string,
  sectionKey: string,
  sectionJson: string,
): Promise<BlueprintActionResult> {
  const parsedKey = sectionKeySchema.safeParse(sectionKey);
  if (!parsedKey.success) return { error: "Unknown blueprint section." };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(sectionJson);
  } catch {
    return {
      error:
        "That edit is not valid JSON. Check for missing quotes, commas, or brackets.",
    };
  }

  const sectionResult = getSectionSchema(parsedKey.data).safeParse(parsedJson);
  if (!sectionResult.success) {
    const issue = sectionResult.error.issues[0];
    return {
      error: `The section doesn't match the expected structure: ${issue?.path.join(".") || "root"} — ${issue?.message ?? "invalid"}.`,
    };
  }

  const context = await loadContext(projectId);
  if ("error" in context) return context;

  const current = await loadBlueprintContent(context, blueprintId);
  if ("error" in current) return current;

  const updated = applySectionValue(
    current.blueprint,
    parsedKey.data,
    sectionResult.data,
  );

  const validated = projectBlueprintSchema.safeParse(updated);
  if (!validated.success) {
    return { error: "The edit would make the blueprint invalid." };
  }

  const label =
    BLUEPRINT_SECTIONS.find((section) => section.key === parsedKey.data)
      ?.label ?? parsedKey.data;
  const saved = await saveBlueprintVersion(
    context,
    validated.data,
    `Manual edit: ${label}`,
  );
  if (saved.error) return { error: saved.error };

  trackEvent("blueprint_edited");
  revalidatePath(`/projects/${projectId}/blueprint`);
  return {};
}

export async function approveBlueprintAction(
  projectId: string,
  blueprintId: string,
): Promise<BlueprintActionResult> {
  const context = await loadContext(projectId);
  if ("error" in context) return context;

  const { error: supersedeError } = await context.supabase
    .from("blueprints")
    .update({ status: "superseded" })
    .eq("project_id", projectId)
    .neq("id", blueprintId);
  if (supersedeError) {
    console.error("blueprint: supersede failed", supersedeError.code);
  }

  const { error: approveError } = await context.supabase
    .from("blueprints")
    .update({ status: "approved" })
    .eq("id", blueprintId)
    .eq("project_id", projectId);
  if (approveError) {
    console.error("blueprint: approve failed", approveError.code);
    return { error: "Could not approve the blueprint. Please try again." };
  }

  const { error: projectError } = await context.supabase
    .from("projects")
    .update({
      status: "approved",
      active_blueprint_version_id: blueprintId,
    })
    .eq("id", projectId);
  if (projectError) {
    console.error(
      "blueprint: project approve update failed",
      projectError.code,
    );
  }

  trackEvent("blueprint_approved");
  revalidatePath(`/projects/${projectId}/blueprint`);
  return {};
}

async function loadBlueprintContent(
  context: ActionContext,
  blueprintId: string,
): Promise<{ blueprint: ProjectBlueprint } | { error: string }> {
  const { data } = await context.supabase
    .from("blueprints")
    .select("*")
    .eq("id", blueprintId)
    .eq("project_id", context.project.id)
    .maybeSingle();

  if (!data) return { error: "Blueprint version not found." };

  const parsed = projectBlueprintSchema.safeParse(
    (data as BlueprintRow).content,
  );
  if (!parsed.success) {
    console.error("blueprint: stored content failed validation");
    return {
      error:
        "This blueprint version is corrupted and cannot be edited. Generate a new version.",
    };
  }
  return { blueprint: parsed.data };
}

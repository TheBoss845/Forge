"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { generateInterviewTurn } from "@/features/interviews/service";
import type { InterviewTurn } from "@/features/interviews/schema";
import { getProject } from "@/features/projects/queries";
import { getAiProvider } from "@/lib/ai";
import { recordAiUsage } from "@/lib/ai/usage";
import { trackEvent } from "@/lib/analytics/events";
import { createSupabaseServerClient } from "@/lib/database/server";
import { AI_RATE_LIMIT, checkRateLimit } from "@/lib/security/rate-limit";
import type { ChatMessage } from "@/lib/ai/types";
import type {
  InterviewMessageRow,
  InterviewSessionRow,
  OrganizationRow,
} from "@/types/database";

const messageSchema = z.string().trim().min(1).max(4000);

export interface InterviewTurnResult {
  error?: string;
  turn?: InterviewTurn;
}

const AI_NOT_CONFIGURED_ERROR =
  "The AI interviewer is not configured yet. The site owner needs to set AI_PROVIDER, AI_MODEL, and AI_API_KEY. Your project and messages are saved.";

/**
 * Advances the discovery interview by one turn. Pass `content` as null to
 * request the opening question without a user message.
 */
export async function sendInterviewMessageAction(
  projectId: string,
  content: string | null,
): Promise<InterviewTurnResult> {
  if (content !== null) {
    const parsedContent = messageSchema.safeParse(content);
    if (!parsedContent.success) {
      return { error: "Messages must be between 1 and 4000 characters." };
    }
    content = parsedContent.data;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Forge is not connected to a database yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const project = await getProject(supabase, projectId);
  if (!project) return { error: "Project not found." };

  const rate = checkRateLimit(`interview:${user.id}`, AI_RATE_LIMIT);
  if (!rate.allowed) {
    return {
      error: `You're sending messages quickly — please wait ${rate.retryAfterSeconds} seconds and try again.`,
    };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", project.organization_id)
    .maybeSingle();
  if (!organization) return { error: "Organization not found." };

  // Load or create the active interview session.
  let { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    const { data: created, error: createError } = await supabase
      .from("interview_sessions")
      .insert({ project_id: project.id, status: "active" })
      .select("*")
      .single();
    if (createError || !created) {
      console.error("interview: session create failed", createError?.code);
      return { error: "Could not start the interview. Please try again." };
    }
    session = created;
  }

  const typedSession = session as InterviewSessionRow;

  const { data: messageRows } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("session_id", typedSession.id)
    .order("created_at", { ascending: true })
    .limit(200);

  const transcript: ChatMessage[] = (
    (messageRows ?? []) as InterviewMessageRow[]
  ).map((row) => ({ role: row.role, content: row.content }));

  if (content !== null) {
    const { error: insertError } = await supabase
      .from("interview_messages")
      .insert({
        session_id: typedSession.id,
        role: "user",
        content,
      });
    if (insertError) {
      console.error("interview: user message insert failed", insertError.code);
      return {
        error: "Could not save your message. Please try again.",
      };
    }
    transcript.push({ role: "user", content });
  }

  const provider = getAiProvider();
  if (!provider) return { error: AI_NOT_CONFIGURED_ERROR };

  let outcome;
  try {
    outcome = await generateInterviewTurn(provider, {
      organization: organization as OrganizationRow,
      project,
      summary: typedSession.summary,
      transcript,
    });
  } catch (error) {
    console.error(
      "interview: turn generation failed",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      error:
        "The AI interviewer had trouble responding. Your message is saved — try again in a moment.",
    };
  }

  const { turn, usage } = outcome;

  const { error: assistantInsertError } = await supabase
    .from("interview_messages")
    .insert({
      session_id: typedSession.id,
      role: "assistant",
      content: turn.message,
      structured_data: {
        whyThisMatters: turn.whyThisMatters,
        suggestedAnswers: turn.suggestedAnswers,
        discoveryComplete: turn.discoveryComplete,
        updatedSummary: turn.updatedSummary,
      },
    });
  if (assistantInsertError) {
    console.error(
      "interview: assistant message insert failed",
      assistantInsertError.code,
    );
  }

  await supabase
    .from("interview_sessions")
    .update({
      summary: turn.updatedSummary,
      current_stage: turn.discoveryComplete ? "complete" : "in_progress",
    })
    .eq("id", typedSession.id);

  for (const result of usage) {
    await recordAiUsage(supabase, {
      organizationId: organization.id,
      projectId: project.id,
      userId: user.id,
      operation: "discovery_interview",
      result,
    });
  }

  return { turn };
}

/** Marks discovery finished and moves the project to the blueprint stage. */
export async function completeInterviewAction(
  projectId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Forge is not connected to a database yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const project = await getProject(supabase, projectId);
  if (!project) return { error: "Project not found." };

  await supabase
    .from("interview_sessions")
    .update({ status: "completed" })
    .eq("project_id", project.id)
    .eq("status", "active");

  const { error } = await supabase
    .from("projects")
    .update({ status: "blueprint" })
    .eq("id", project.id);

  if (error) {
    console.error("interview: project status update failed", error.code);
    return { error: "Could not continue to the blueprint. Please try again." };
  }

  trackEvent("interview_completed");
  redirect(`/projects/${project.id}/blueprint`);
}

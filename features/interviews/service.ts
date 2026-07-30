import {
  buildDiscoverySystemPrompt,
  JSON_REPAIR_INSTRUCTION,
} from "@/features/interviews/prompts";
import {
  interviewTurnSchema,
  type InterviewTurn,
} from "@/features/interviews/schema";
import { completeWithRetry } from "@/lib/ai";
import { extractJsonObject } from "@/lib/ai/json";
import type { AiProvider, ChatMessage, CompletionResult } from "@/lib/ai/types";
import type { OrganizationRow, ProjectRow } from "@/types/database";
import type { InterviewSummaryData } from "@/features/interviews/schema";

export interface InterviewTurnOutcome {
  turn: InterviewTurn;
  usage: CompletionResult[];
}

/**
 * Produces the next interview turn: builds the prompt, calls the provider,
 * validates the structured output, and attempts one structured repair pass
 * before failing.
 */
export async function generateInterviewTurn(
  provider: AiProvider,
  context: {
    organization: OrganizationRow;
    project: ProjectRow;
    summary: InterviewSummaryData | null;
    transcript: ChatMessage[];
  },
): Promise<InterviewTurnOutcome> {
  const system = buildDiscoverySystemPrompt(context);
  const messages: ChatMessage[] =
    context.transcript.length > 0
      ? context.transcript
      : [{ role: "user", content: "Please begin the interview." }];

  const usage: CompletionResult[] = [];

  const first = await completeWithRetry(provider, {
    system,
    messages,
    jsonMode: true,
    maxOutputTokens: 2048,
  });
  usage.push(first);

  const parsed = parseTurn(first.text);
  if (parsed) return { turn: parsed, usage };

  // Structured repair: show the model its own output and ask for valid JSON.
  console.error("interview: AI output failed validation, attempting repair");
  const repair = await completeWithRetry(provider, {
    system,
    messages: [
      ...messages,
      { role: "assistant", content: first.text },
      { role: "user", content: JSON_REPAIR_INSTRUCTION },
    ],
    jsonMode: true,
    maxOutputTokens: 2048,
  });
  usage.push(repair);

  const repaired = parseTurn(repair.text);
  if (repaired) return { turn: repaired, usage };

  throw new Error("The AI response could not be validated after repair.");
}

function parseTurn(text: string): InterviewTurn | null {
  const json = extractJsonObject(text);
  if (!json) return null;
  const result = interviewTurnSchema.safeParse(json);
  return result.success ? result.data : null;
}

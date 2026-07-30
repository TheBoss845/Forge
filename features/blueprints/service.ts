import {
  BLUEPRINT_REPAIR_INSTRUCTION,
  buildBlueprintSystemPrompt,
  buildRevisionSystemPrompt,
} from "@/features/blueprints/prompts";
import {
  projectBlueprintSchema,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import { completeWithRetry } from "@/lib/ai";
import { extractJsonObject } from "@/lib/ai/json";
import type { AiProvider, ChatMessage, CompletionResult } from "@/lib/ai/types";
import type { OrganizationRow, ProjectRow } from "@/types/database";

export interface BlueprintOutcome {
  blueprint: ProjectBlueprint;
  usage: CompletionResult[];
}

export async function generateBlueprint(
  provider: AiProvider,
  context: {
    organization: OrganizationRow;
    project: ProjectRow;
    transcript: ChatMessage[];
  },
): Promise<BlueprintOutcome> {
  const system = buildBlueprintSystemPrompt(context);
  return runBlueprintCompletion(provider, system, [
    { role: "user", content: "Produce the project blueprint now." },
  ]);
}

export async function reviseBlueprint(
  provider: AiProvider,
  context: {
    currentBlueprint: ProjectBlueprint;
    instruction: string;
  },
): Promise<BlueprintOutcome> {
  const system = buildRevisionSystemPrompt();
  return runBlueprintCompletion(provider, system, [
    {
      role: "user",
      content: `Current blueprint JSON:\n${JSON.stringify(context.currentBlueprint)}\n\nRequested change:\n${context.instruction}`,
    },
  ]);
}

async function runBlueprintCompletion(
  provider: AiProvider,
  system: string,
  messages: ChatMessage[],
): Promise<BlueprintOutcome> {
  const usage: CompletionResult[] = [];

  const first = await completeWithRetry(provider, {
    system,
    messages,
    jsonMode: true,
    maxOutputTokens: 8192,
  });
  usage.push(first);

  const parsed = parseBlueprint(first.text);
  if (parsed) return { blueprint: parsed, usage };

  console.error("blueprint: AI output failed validation, attempting repair");
  const repair = await completeWithRetry(provider, {
    system,
    messages: [
      ...messages,
      { role: "assistant", content: first.text },
      { role: "user", content: BLUEPRINT_REPAIR_INSTRUCTION },
    ],
    jsonMode: true,
    maxOutputTokens: 8192,
  });
  usage.push(repair);

  const repaired = parseBlueprint(repair.text);
  if (repaired) return { blueprint: repaired, usage };

  throw new Error("The blueprint could not be validated after repair.");
}

function parseBlueprint(text: string): ProjectBlueprint | null {
  const json = extractJsonObject(text);
  if (!json) return null;
  const result = projectBlueprintSchema.safeParse(json);
  return result.success ? result.data : null;
}

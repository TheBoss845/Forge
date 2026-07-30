import { z } from "zod";

import { completeWithRetry } from "@/lib/ai";
import { extractJsonObject } from "@/lib/ai/json";
import type { AiProvider, CompletionResult } from "@/lib/ai/types";

export const aiEditResultSchema = z.object({
  explanation: z.string().min(1).max(2000),
  updatedContent: z.string().min(1).max(200_000),
});

export type AiEditResult = z.infer<typeof aiEditResultSchema>;

const SYSTEM_PROMPT = `You are Forge's code-modification agent. You edit ONE file of a generated Next.js starter application at a business owner's request. The owner is usually not a programmer; your diff will be shown to them for approval before anything is saved.

RULES
- Apply the requested change faithfully and completely, changing as little else as possible — the reviewer sees a line diff, and noise erodes trust.
- Keep the file valid for its language, and preserve the existing style: same quoting, same indentation, same naming conventions, same CSS variable tokens.
- The project is bare Next.js + React + TypeScript with plain CSS. Do not invent imports from packages that are not installed, and do not introduce new dependencies.
- Never remove the honest "sample data / not saved yet" notices unless the request explicitly wires up real behavior.
- If the request cannot be fully done in this one file, do what is possible here and say plainly in the explanation what other file would need to change.
- If the request is ambiguous, choose the most likely interpretation and say so in the explanation.
- The explanation is for a business owner: one to three short sentences, plain language, no jargon ("Changed the page heading and added a welcome sentence under it.").

OUTPUT
Respond with a single JSON object and nothing else:
{ "explanation": "what you changed and why", "updatedContent": "the complete new file content" }`;

export interface AiEditOutcome {
  edit: AiEditResult;
  usage: CompletionResult[];
}

export async function generateFileEdit(
  provider: AiProvider,
  params: { path: string; content: string; instruction: string },
): Promise<AiEditOutcome> {
  const userMessage = `File path: ${params.path}\n\nCurrent file content:\n\u0060\u0060\u0060\n${params.content}\n\u0060\u0060\u0060\n\nRequested change:\n${params.instruction}`;

  const usage: CompletionResult[] = [];
  const first = await completeWithRetry(provider, {
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    jsonMode: true,
    maxOutputTokens: 8192,
  });
  usage.push(first);

  const parsed = parse(first.text);
  if (parsed) return { edit: parsed, usage };

  const repair = await completeWithRetry(provider, {
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: userMessage },
      { role: "assistant", content: first.text },
      {
        role: "user",
        content:
          "Your previous reply was not valid JSON with keys explanation and updatedContent. Respond again with ONLY the corrected JSON object.",
      },
    ],
    jsonMode: true,
    maxOutputTokens: 8192,
  });
  usage.push(repair);

  const repaired = parse(repair.text);
  if (repaired) return { edit: repaired, usage };

  throw new Error("The AI edit could not be validated after repair.");
}

function parse(text: string): AiEditResult | null {
  const json = extractJsonObject(text);
  if (!json) return null;
  const result = aiEditResultSchema.safeParse(json);
  return result.success ? result.data : null;
}

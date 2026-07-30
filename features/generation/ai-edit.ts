import { z } from "zod";

import { completeWithRetry } from "@/lib/ai";
import { extractJsonObject } from "@/lib/ai/json";
import type { AiProvider, CompletionResult } from "@/lib/ai/types";

export const aiEditResultSchema = z.object({
  explanation: z.string().min(1).max(2000),
  updatedContent: z.string().min(1).max(200_000),
});

export type AiEditResult = z.infer<typeof aiEditResultSchema>;

const SYSTEM_PROMPT = `You are Forge's code-modification agent. You edit ONE file of a generated Next.js starter application at the user's request.

RULES
- Apply the requested change to the file faithfully and completely.
- Keep the file valid for its language. Preserve the existing style.
- Do not invent imports from packages that are not in a bare Next.js + React + TypeScript project.
- If the request cannot be done in this file alone, do what is possible here and say what else would be needed in the explanation.
- Keep the explanation short and in plain business-friendly language.

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

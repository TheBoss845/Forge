import { createAnthropicProvider } from "@/lib/ai/anthropic";
import { createOpenAiProvider } from "@/lib/ai/openai";
import {
  AiError,
  type AiProvider,
  type CompletionRequest,
  type CompletionResult,
} from "@/lib/ai/types";

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_PROVIDER && process.env.AI_API_KEY);
}

/**
 * Builds the configured AI provider from environment variables.
 * Returns null when unconfigured so callers can respond honestly.
 */
export function getAiProvider(): AiProvider | null {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  if (!provider || !apiKey) return null;

  if (provider === "openai") {
    return createOpenAiProvider({
      apiKey,
      model: process.env.AI_MODEL || "gpt-4o",
      baseUrl: process.env.AI_BASE_URL,
    });
  }
  if (provider === "anthropic") {
    return createAnthropicProvider({
      apiKey,
      model: process.env.AI_MODEL || "claude-sonnet-4-5",
    });
  }

  console.error(`ai: unknown AI_PROVIDER "${provider}"`);
  return null;
}

/** Runs a completion with one automatic retry for transient failures. */
export async function completeWithRetry(
  provider: AiProvider,
  request: CompletionRequest,
): Promise<CompletionResult> {
  try {
    return await provider.complete(request);
  } catch (error) {
    if (error instanceof AiError && error.retryable) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return provider.complete(request);
    }
    throw error;
  }
}

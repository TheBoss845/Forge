import { createAnthropicProvider } from "@/lib/ai/anthropic";
import { createOpenAiProvider } from "@/lib/ai/openai";
import {
  AiError,
  type AiProvider,
  type CompletionRequest,
  type CompletionResult,
} from "@/lib/ai/types";

interface ResolvedAiConfig {
  provider: "openai" | "anthropic";
  apiKey: string;
}

/**
 * Resolves the AI configuration forgivingly:
 * - AI_PROVIDER + AI_API_KEY is the canonical form.
 * - A bare OPENAI_API_KEY or ANTHROPIC_API_KEY also works, and the provider
 *   is inferred, so a single secret is enough to bring the AI online.
 */
function resolveAiConfig(): ResolvedAiConfig | null {
  const explicitProvider = process.env.AI_PROVIDER?.toLowerCase();
  const genericKey = process.env.AI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (explicitProvider === "openai" || explicitProvider === "anthropic") {
    const apiKey =
      genericKey || (explicitProvider === "openai" ? openAiKey : anthropicKey);
    return apiKey ? { provider: explicitProvider, apiKey } : null;
  }
  if (explicitProvider) {
    console.error(`ai: unknown AI_PROVIDER "${explicitProvider}"`);
    return null;
  }

  if (openAiKey) return { provider: "openai", apiKey: openAiKey };
  if (anthropicKey) return { provider: "anthropic", apiKey: anthropicKey };
  // A generic key without a provider is assumed to be OpenAI, by far the
  // most common case.
  if (genericKey) return { provider: "openai", apiKey: genericKey };
  return null;
}

export function isAiConfigured(): boolean {
  return resolveAiConfig() !== null;
}

/**
 * Builds the configured AI provider from environment variables.
 * Returns null when unconfigured so callers can respond honestly.
 */
export function getAiProvider(): AiProvider | null {
  const config = resolveAiConfig();
  if (!config) return null;

  if (config.provider === "openai") {
    return createOpenAiProvider({
      apiKey: config.apiKey,
      model: process.env.AI_MODEL || "gpt-4o",
      baseUrl: process.env.AI_BASE_URL,
    });
  }
  return createAnthropicProvider({
    apiKey: config.apiKey,
    model: process.env.AI_MODEL || "claude-sonnet-4-5",
  });
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

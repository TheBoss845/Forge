import {
  AI_REQUEST_TIMEOUT_MS,
  AiError,
  type AiProvider,
  type CompletionRequest,
  type CompletionResult,
} from "@/lib/ai/types";

interface OpenAiChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

/**
 * OpenAI-compatible chat-completions provider. Works with OpenAI itself and
 * any API implementing the same protocol (set AI_BASE_URL to override).
 */
export function createOpenAiProvider(options: {
  apiKey: string;
  model: string;
  baseUrl?: string;
}): AiProvider {
  const baseUrl = (options.baseUrl ?? "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );

  return {
    name: "openai",
    model: options.model,
    async complete(request: CompletionRequest): Promise<CompletionResult> {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${options.apiKey}`,
          },
          body: JSON.stringify({
            model: options.model,
            messages: [
              { role: "system", content: request.system },
              ...request.messages,
            ],
            max_completion_tokens: request.maxOutputTokens ?? 4096,
            ...(request.temperature !== undefined
              ? { temperature: request.temperature }
              : {}),
            ...(request.jsonMode
              ? { response_format: { type: "json_object" } }
              : {}),
          }),
          signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
        });
      } catch {
        throw new AiError("The AI request timed out or failed to send.", true);
      }

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        throw new AiError(
          `AI provider returned status ${response.status}.`,
          retryable,
        );
      }

      const data = (await response.json()) as OpenAiChatResponse;
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new AiError("The AI provider returned an empty response.", true);
      }

      return {
        text,
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        provider: "openai",
        model: options.model,
      };
    },
  };
}

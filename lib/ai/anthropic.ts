import {
  AI_REQUEST_TIMEOUT_MS,
  AiError,
  type AiProvider,
  type CompletionRequest,
  type CompletionResult,
} from "@/lib/ai/types";

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export function createAnthropicProvider(options: {
  apiKey: string;
  model: string;
}): AiProvider {
  return {
    name: "anthropic",
    model: options.model,
    async complete(request: CompletionRequest): Promise<CompletionResult> {
      // Anthropic has no dedicated JSON mode; the system prompt instructs the
      // model, and responses are validated and repaired downstream.
      const system = request.jsonMode
        ? `${request.system}\n\nRespond with a single valid JSON object and nothing else.`
        : request.system;

      let response: Response;
      try {
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": options.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: options.model,
            system,
            messages: request.messages,
            max_tokens: request.maxOutputTokens ?? 4096,
            ...(request.temperature !== undefined
              ? { temperature: request.temperature }
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

      const data = (await response.json()) as AnthropicResponse;
      const text = data.content?.find((block) => block.type === "text")?.text;
      if (!text) {
        throw new AiError("The AI provider returned an empty response.", true);
      }

      return {
        text,
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
        provider: "anthropic",
        model: options.model,
      };
    },
  };
}

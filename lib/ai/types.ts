export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  system: string;
  messages: ChatMessage[];
  maxOutputTokens?: number;
  temperature?: number;
  /** Ask the provider to return a single JSON object. */
  jsonMode?: boolean;
}

export interface CompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  model: string;
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  complete(request: CompletionRequest): Promise<CompletionResult>;
}

export class AiError extends Error {
  constructor(
    message: string,
    /** Whether retrying the same request may succeed (rate limit, 5xx). */
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export const AI_REQUEST_TIMEOUT_MS = 90_000;

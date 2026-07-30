import type { SupabaseClient } from "@supabase/supabase-js";

import type { CompletionResult } from "@/lib/ai/types";

/** Records token usage for billing and fair-use limits. Failures are logged, never thrown. */
export async function recordAiUsage(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    projectId?: string;
    userId: string;
    operation: string;
    result: CompletionResult;
  },
): Promise<void> {
  const { error } = await supabase.from("ai_usage").insert({
    organization_id: params.organizationId,
    project_id: params.projectId ?? null,
    user_id: params.userId,
    operation: params.operation,
    provider: params.result.provider,
    model: params.result.model,
    input_tokens: params.result.inputTokens,
    output_tokens: params.result.outputTokens,
    estimated_cost: null,
  });
  if (error) {
    console.error("ai_usage: insert failed", error.code);
  }
}

import { isSupabaseConfigured } from "@/lib/database/env";
import { isKvAvailable } from "@/lib/storage/kv";

export type AccountsMode = "supabase" | "local" | "none";

/**
 * What kind of accounts this deployment supports:
 * - "supabase": full cloud accounts (database configured)
 * - "local":    Forge's built-in accounts on platform storage
 * - "none":     device-only workspaces
 */
export function getAccountsMode(): AccountsMode {
  if (isSupabaseConfigured()) return "supabase";
  if (isKvAvailable()) return "local";
  return "none";
}

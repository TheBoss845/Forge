"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/database/env";

let browserClient: SupabaseClient | null = null;

/** Browser-side Supabase client; null when Supabase is not configured. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  browserClient ??= createBrowserClient(
    getSupabaseUrl()!,
    getSupabaseAnonKey()!,
  );
  return browserClient;
}

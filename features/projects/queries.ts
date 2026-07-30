import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProjectRow } from "@/types/database";

/**
 * Fetches a project by id. Row-level security guarantees the result is null
 * unless the current user belongs to the project's organization.
 */
export async function getProject(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectRow | null> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  return data as ProjectRow | null;
}

export async function listProjects(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ProjectRow[]> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(50);
  return (data ?? []) as ProjectRow[];
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BlueprintRow } from "@/types/database";

export async function listBlueprintVersions(
  supabase: SupabaseClient,
  projectId: string,
): Promise<BlueprintRow[]> {
  const { data } = await supabase
    .from("blueprints")
    .select("*")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(50);
  return (data ?? []) as BlueprintRow[];
}

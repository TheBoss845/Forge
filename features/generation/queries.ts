import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProjectFileRow {
  id: string;
  project_id: string;
  path: string;
  content: string;
  language: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectVersionRow {
  id: string;
  project_id: string;
  version_number: number;
  description: string | null;
  snapshot: {
    files: Array<{ path: string; content: string; language: string }>;
  } | null;
  created_by: string;
  created_at: string;
}

export interface GenerationJobRow {
  id: string;
  project_id: string;
  job_type: string;
  status: "queued" | "running" | "completed" | "failed";
  progress_stage: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export async function listProjectFiles(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectFileRow[]> {
  const { data } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("path", { ascending: true })
    .limit(200);
  return (data ?? []) as ProjectFileRow[];
}

export async function listProjectVersions(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectVersionRow[]> {
  const { data } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(30);
  return (data ?? []) as ProjectVersionRow[];
}

export async function getLatestGenerationJob(
  supabase: SupabaseClient,
  projectId: string,
): Promise<GenerationJobRow | null> {
  const { data } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as GenerationJobRow | null;
}

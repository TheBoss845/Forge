import type { SupabaseClient } from "@supabase/supabase-js";

import { getProject } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/database/server";
import type { OrganizationRow, ProjectRow } from "@/types/database";

export interface ProjectActionContext {
  supabase: SupabaseClient;
  userId: string;
  project: ProjectRow;
  organization: OrganizationRow;
}

/**
 * Shared loader for project-scoped server actions: authenticates the user
 * and loads the project + organization (RLS guarantees membership).
 */
export async function loadProjectContext(
  projectId: string,
): Promise<ProjectActionContext | { error: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Forge is not connected to a database yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const project = await getProject(supabase, projectId);
  if (!project) return { error: "Project not found." };

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", project.organization_id)
    .maybeSingle();
  if (!organization) return { error: "Organization not found." };

  return {
    supabase,
    userId: user.id,
    project,
    organization: organization as OrganizationRow,
  };
}

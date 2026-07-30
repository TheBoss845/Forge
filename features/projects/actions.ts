"use server";

import { redirect } from "next/navigation";

import {
  deriveProjectName,
  newProjectSchema,
} from "@/features/projects/validation";
import { getPrimaryOrganization } from "@/features/organizations/queries";
import { trackEvent } from "@/lib/analytics/events";
import { createSupabaseServerClient } from "@/lib/database/server";
import { slugify } from "@/lib/utilities/slug";

export interface ProjectActionResult {
  error?: string;
}

export async function createProjectAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = newProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Forge is not connected to a database yet." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  const organization = await getPrimaryOrganization(supabase, user.id);
  if (!organization) {
    return { error: "Finish onboarding before creating a project." };
  }

  const name = deriveProjectName(parsed.data.prompt);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: organization.id,
      name,
      slug: slugify(name),
      status: "discovery",
      industry: organization.industry,
      original_prompt: parsed.data.prompt,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("projects: insert failed", projectError?.code);
    return {
      error:
        "Could not create the project. Nothing was saved — please try again.",
    };
  }

  const { error: sessionError } = await supabase
    .from("interview_sessions")
    .insert({ project_id: project.id, status: "active" });

  if (sessionError) {
    console.error(
      "projects: interview session insert failed",
      sessionError.code,
    );
  }

  trackEvent("project_created");
  trackEvent("interview_started");
  redirect(`/projects/${project.id}/interview`);
}

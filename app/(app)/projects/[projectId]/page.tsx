import { notFound, redirect } from "next/navigation";

import { getProject } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

/** Routes the user to the right stage of their project. */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const project = await getProject(supabase, projectId);
  if (!project) notFound();

  if (project.status === "discovery") {
    redirect(`/projects/${project.id}/interview`);
  }
  redirect(`/projects/${project.id}/blueprint`);
}

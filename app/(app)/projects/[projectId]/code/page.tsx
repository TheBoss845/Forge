import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CodeWorkspace } from "@/components/code/code-workspace";
import { GenerateAppCard } from "@/components/code/generate-app-card";
import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { Alert } from "@/components/ui/alert";
import {
  getLatestGenerationJob,
  listProjectFiles,
  listProjectVersions,
} from "@/features/generation/queries";
import { getProject } from "@/features/projects/queries";
import { isAiConfigured } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/database/server";

export const metadata: Metadata = { title: "Code" };

export default async function CodePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const project = await getProject(supabase, projectId);
  if (!project) notFound();

  const [files, versions, job, blueprintCount] = await Promise.all([
    listProjectFiles(supabase, project.id),
    listProjectVersions(supabase, project.id),
    getLatestGenerationJob(supabase, project.id),
    supabase
      .from("blueprints")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id)
      .then((result) => result.count ?? 0),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <ProjectPageHeader
        project={project}
        subtitle="The generated codebase — download it, run it, and modify it."
      />
      <ProjectTabs projectId={project.id} />

      {job?.status === "failed" ? (
        <Alert variant="danger" className="mt-6">
          The last generation failed
          {job.error_message ? `: ${job.error_message}` : "."} You can try again
          below.
        </Alert>
      ) : null}

      {files.length === 0 ? (
        <GenerateAppCard
          projectId={project.id}
          hasBlueprint={blueprintCount > 0}
        />
      ) : (
        <CodeWorkspace
          projectId={project.id}
          files={files.map((file) => ({
            path: file.path,
            content: file.content,
            language: file.language,
          }))}
          versions={versions.map((version) => ({
            id: version.id,
            versionNumber: version.version_number,
            description: version.description,
            createdAt: version.created_at,
          }))}
          aiConfigured={isAiConfigured()}
        />
      )}
    </div>
  );
}

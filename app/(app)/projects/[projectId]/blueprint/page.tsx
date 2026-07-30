import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BlueprintWorkspace } from "@/components/blueprint/blueprint-workspace";
import { GenerateBlueprintCard } from "@/components/blueprint/generate-blueprint-card";
import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { Alert } from "@/components/ui/alert";
import { projectBlueprintSchema } from "@/features/blueprints/schema";
import { listBlueprintVersions } from "@/features/blueprints/queries";
import { getProject } from "@/features/projects/queries";
import { isAiConfigured } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/database/server";

export const metadata: Metadata = { title: "Blueprint" };

export default async function BlueprintPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ version?: string }>;
}) {
  const { projectId } = await params;
  const { version } = await searchParams;

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const project = await getProject(supabase, projectId);
  if (!project) notFound();

  const versions = await listBlueprintVersions(supabase, project.id);

  if (versions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <ProjectPageHeader
          project={project}
          subtitle="Turn the discovery interview into a complete project plan."
        />
        <GenerateBlueprintCard
          projectId={project.id}
          aiConfigured={isAiConfigured()}
        />
      </div>
    );
  }

  const requestedVersion = version ? Number.parseInt(version, 10) : null;
  const selected =
    (requestedVersion
      ? versions.find((item) => item.version_number === requestedVersion)
      : null) ?? versions[0];

  const parsed = projectBlueprintSchema.safeParse(selected.content);

  return (
    <div className="mx-auto max-w-6xl">
      <ProjectPageHeader
        project={project}
        subtitle="Review, edit, and approve the plan before anything gets built."
      />
      {parsed.success ? (
        <BlueprintWorkspace
          projectId={project.id}
          blueprint={parsed.data}
          blueprintId={selected.id}
          blueprintStatus={selected.status}
          versionNumber={selected.version_number}
          isLatestVersion={selected.id === versions[0].id}
          versions={versions.map((item) => ({
            versionNumber: item.version_number,
            status: item.status,
            summary: item.summary,
            createdAt: item.created_at,
          }))}
          aiConfigured={isAiConfigured()}
        />
      ) : (
        <Alert variant="danger" className="mt-6">
          <p className="font-medium text-primary">
            This blueprint version could not be read.
          </p>
          <p className="mt-1">
            The stored data does not match the expected structure. Choose a
            different version or generate a new blueprint.
          </p>
        </Alert>
      )}
    </div>
  );
}

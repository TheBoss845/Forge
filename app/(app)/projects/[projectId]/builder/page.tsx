import { FileText, Hammer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PrototypePreview } from "@/components/builder/prototype-preview";
import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { projectBlueprintSchema } from "@/features/blueprints/schema";
import { listBlueprintVersions } from "@/features/blueprints/queries";
import { getProject } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

export const metadata: Metadata = { title: "Builder" };

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const project = await getProject(supabase, projectId);
  if (!project) notFound();

  const versions = await listBlueprintVersions(supabase, project.id);
  const active =
    versions.find((version) => version.status === "approved") ?? versions[0];
  const parsed = active
    ? projectBlueprintSchema.safeParse(active.content)
    : null;

  if (!active || !parsed?.success) {
    return (
      <div className="mx-auto max-w-3xl">
        <ProjectPageHeader
          project={project}
          subtitle="Preview how your planned application will work."
        />
        <ProjectTabs projectId={project.id} />
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-muted">
              <FileText className="size-6 text-accent" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-section-title text-primary">
              No blueprint to preview yet
            </h2>
            <p className="mt-2 max-w-md text-body-sm text-secondary">
              The builder shows an interactive prototype of your application,
              generated from the blueprint. Finish the discovery interview and
              generate a blueprint first.
            </p>
            <Link
              href={`/projects/${project.id}`}
              className={`${buttonVariants({})} mt-6`}
            >
              Continue planning
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <ProjectPageHeader
        project={project}
        subtitle="An interactive prototype of your application, generated from the blueprint."
      />

      <PrototypePreview blueprint={parsed.data} />

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:text-left">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-muted">
            <Hammer className="size-5 text-accent" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 className="text-card-title text-primary">Like what you see?</h2>
            <p className="mt-1 text-body-sm text-secondary">
              Generate the real starter codebase from this blueprint in the Code
              tab: every page, typed data models, sample data, and a
              ready-to-apply database schema. Download it, run it, and modify it
              — by hand or by asking Forge.
            </p>
          </div>
          <Link
            href={`/projects/${project.id}/code`}
            className={buttonVariants({ size: "sm" })}
          >
            Generate the code
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

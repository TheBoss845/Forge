import { Hammer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="mx-auto max-w-3xl">
      <ProjectPageHeader
        project={project}
        subtitle="Where your approved blueprint becomes a working application."
      />
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent-muted">
            <Hammer className="size-6 text-accent" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-section-title text-primary">
            Application generation is not available yet
          </h2>
          <p className="mt-2 max-w-md text-body-sm text-secondary">
            This is the next phase of Forge: template-based application
            generation from approved blueprints, followed by conversational
            editing, testing, and deployment. Nothing here is simulated — this
            screen will activate when the feature actually works.
          </p>
          <p className="mt-3 max-w-md text-body-sm text-secondary">
            Your approved blueprint is saved and versioned, and will be the
            direct input to generation when it ships.
          </p>
          <Link
            href={`/projects/${project.id}/blueprint`}
            className={`${buttonVariants({ variant: "secondary" })} mt-6`}
          >
            Back to blueprint
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

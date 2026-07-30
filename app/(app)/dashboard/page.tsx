import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPrimaryOrganization } from "@/features/organizations/queries";
import { listProjects } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/database/server";
import { formatRelativeTime } from "@/lib/utilities/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const organization = await getPrimaryOrganization(supabase, user.id);
  if (!organization) redirect("/onboarding");

  const projects = await listProjects(supabase, organization.id);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title text-primary">Dashboard</h1>
          <p className="mt-1 text-body-sm text-secondary">
            {organization.name}
          </p>
        </div>
        <Link href="/projects/new" className={buttonVariants({})}>
          <Plus aria-hidden="true" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-muted">
              <FolderKanban className="size-6 text-accent" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-section-title text-primary">
              Start your first project
            </h2>
            <p className="mt-2 max-w-md text-body-sm text-secondary">
              Describe what your business needs — a booking system, a customer
              portal, an internal dashboard — and Forge will interview you and
              draw up the plan.
            </p>
            <Link
              href="/projects/new"
              className={`${buttonVariants({ size: "lg" })} mt-6`}
            >
              Describe what you need
              <ArrowRight aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block h-full rounded-lg border border-border-subtle bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-card-title text-primary">
                    {project.name}
                  </h2>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-body-sm text-secondary">
                  {project.description ?? project.original_prompt}
                </p>
                <p className="mt-3 text-caption text-muted">
                  Updated {formatRelativeTime(project.updated_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Forge works</CardTitle>
          <CardDescription>
            The path from idea to working software.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-4 text-body-sm text-secondary sm:grid-cols-3">
            <li>
              <span className="font-medium text-primary">1. Discovery.</span>{" "}
              Forge interviews you about the problem, your users, and what
              success looks like.
            </li>
            <li>
              <span className="font-medium text-primary">2. Blueprint.</span>{" "}
              You get a complete, editable plan: features, pages, data, roles,
              and workflows.
            </li>
            <li>
              <span className="font-medium text-primary">3. Build.</span>{" "}
              Approve the blueprint and Forge generates a runnable starter
              codebase — preview it, download it, and modify it by asking Forge
              in plain language.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

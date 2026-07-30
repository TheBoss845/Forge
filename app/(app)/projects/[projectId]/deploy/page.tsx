import { Download, ExternalLink, Rocket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projectBlueprintSchema } from "@/features/blueprints/schema";
import { listBlueprintVersions } from "@/features/blueprints/queries";
import { listProjectFiles } from "@/features/generation/queries";
import { getProject } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

export const metadata: Metadata = { title: "Deploy" };

export default async function DeployPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const project = await getProject(supabase, projectId);
  if (!project) notFound();

  const [files, blueprintVersions] = await Promise.all([
    listProjectFiles(supabase, project.id),
    listBlueprintVersions(supabase, project.id),
  ]);

  const latestBlueprint = blueprintVersions[0]
    ? projectBlueprintSchema.safeParse(blueprintVersions[0].content)
    : null;
  const integrations = latestBlueprint?.success
    ? latestBlueprint.data.integrations
    : [];
  const hasDataModels = latestBlueprint?.success
    ? latestBlueprint.data.dataModels.length > 0
    : false;

  return (
    <div className="mx-auto max-w-4xl">
      <ProjectPageHeader
        project={project}
        subtitle="Put your generated application on the internet."
      />
      <ProjectTabs projectId={project.id} />

      {files.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-muted">
              <Rocket className="size-6 text-accent" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-section-title text-primary">
              Nothing to deploy yet
            </h2>
            <p className="mt-2 max-w-md text-body-sm text-secondary">
              Generate your application first — then this page walks you through
              putting it online, step by step.
            </p>
            <Link
              href={`/projects/${project.id}/code`}
              className={`${buttonVariants({})} mt-6`}
            >
              Go to Code
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1. Get your code</CardTitle>
              <CardDescription>
                Download the generated application and put it in a GitHub
                repository (github.com → New repository → upload the files, or
                use git locally).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={`/api/projects/${project.id}/download`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <Download aria-hidden="true" />
                Download ZIP ({files.length} files)
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Deploy the site</CardTitle>
              <CardDescription>
                Your generated app is a standard Next.js project — both major
                hosts deploy it with zero configuration and a free tier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-body-sm text-secondary">
                <li>
                  Sign in to{" "}
                  <a
                    href="https://www.netlify.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Netlify
                    <ExternalLink
                      className="ml-0.5 inline size-3"
                      aria-hidden="true"
                    />
                  </a>{" "}
                  or{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Vercel
                    <ExternalLink
                      className="ml-0.5 inline size-3"
                      aria-hidden="true"
                    />
                  </a>{" "}
                  with your GitHub account.
                </li>
                <li>Choose “Import project” and pick your repository.</li>
                <li>
                  Accept the detected Next.js defaults and click Deploy. Your
                  app will be live on a free subdomain in a few minutes.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Connect real data (when ready)</CardTitle>
              <CardDescription>
                The starter runs on clearly-labeled sample data. When you want
                real records and sign-ins:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-body-sm text-secondary">
                {hasDataModels ? (
                  <li>
                    Create a free Supabase project and run the included{" "}
                    <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-code">
                      supabase/schema.sql
                    </code>{" "}
                    — it contains your data models as real database tables.
                  </li>
                ) : null}
                <li>
                  Copy{" "}
                  <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-code">
                    .env.example
                  </code>{" "}
                  to your host&apos;s environment variables and fill in the
                  keys.
                </li>
                {integrations.length > 0 ? (
                  <li>
                    Planned integrations from your blueprint:{" "}
                    {integrations
                      .map(
                        (integration) =>
                          `${integration.name} (${integration.required ? "required" : "optional"})`,
                      )
                      .join(", ")}
                    .
                  </li>
                ) : null}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5">
              <p className="text-body-sm text-secondary">
                <span className="font-medium text-primary">
                  Coming later, honestly:
                </span>{" "}
                one-click deployment from inside Forge (connecting your
                Netlify/Vercel account, build logs, and deployment status).
                Until then, the steps above are the real, reliable path — the
                same one professionals use.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

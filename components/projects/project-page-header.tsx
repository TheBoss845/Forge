import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import type { ProjectRow } from "@/types/database";

export function ProjectPageHeader({
  project,
  subtitle,
}: {
  project: ProjectRow;
  subtitle: string;
}) {
  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md text-body-sm text-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-page-title text-primary">{project.name}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="mt-1 text-body-sm text-secondary">{subtitle}</p>
    </div>
  );
}

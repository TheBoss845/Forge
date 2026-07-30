import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/database";

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "neutral" | "accent" | "success" | "warning" }
> = {
  discovery: { label: "In discovery", variant: "accent" },
  blueprint: { label: "Blueprint ready", variant: "warning" },
  approved: { label: "Blueprint approved", variant: "success" },
  generating: { label: "Generating", variant: "accent" },
  ready: { label: "Ready", variant: "success" },
  deployed: { label: "Deployed", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status] ?? statusConfig.discovery;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

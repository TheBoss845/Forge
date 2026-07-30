import { Hammer } from "lucide-react";

import { cn } from "@/lib/utilities/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Hammer className="size-4.5" aria-hidden="true" />
      </span>
      <span className="text-card-title tracking-tight text-primary">Forge</span>
    </span>
  );
}

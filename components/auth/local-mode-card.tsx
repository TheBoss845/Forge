import { ArrowRight, MonitorSmartphone } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/**
 * Shown on auth pages when no database is configured: instead of a dead
 * sign-in form, offer the device workspace, which needs no account.
 */
export function LocalModeCard() {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-muted">
        <MonitorSmartphone className="size-6 text-accent" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-section-title text-primary">
        No sign-in needed here
      </h1>
      <p className="mt-2 text-body-sm text-secondary">
        This Forge runs in device-workspace mode: your projects — interviews,
        blueprints, prototypes, and generated code — are saved right on this
        device. Nothing to register, nothing to remember.
      </p>
      <Link
        href="/try"
        className={`${buttonVariants({ size: "lg" })} mt-6 w-full`}
      >
        Open your workspace
        <ArrowRight aria-hidden="true" />
      </Link>
      <p className="mt-4 text-caption text-muted">
        Cloud accounts (sign in from any device, team workspaces) switch on
        automatically when the site owner connects a database.
      </p>
    </div>
  );
}

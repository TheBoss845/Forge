import { Bot, CheckCircle2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * A static illustration of the Forge discovery-to-blueprint experience.
 * Purely visual — labeled as an illustration, it performs no real AI calls.
 */
export function DemoMockup() {
  return (
    <figure className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-elevated">
        <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-muted px-4 py-3">
          <span className="size-3 rounded-full bg-border-strong" />
          <span className="size-3 rounded-full bg-border-strong" />
          <span className="size-3 rounded-full bg-border-strong" />
          <span className="ml-3 text-caption text-muted">
            Forge — Discovery interview
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-5">
          <div className="space-y-4 p-6 md:col-span-3 md:border-r md:border-border-subtle">
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                <User className="size-3.5 text-secondary" aria-hidden="true" />
              </span>
              <p className="rounded-lg rounded-tl-none bg-surface-muted px-4 py-3 text-body-sm text-primary">
                I own a veterinary clinic and need customers to book
                appointments online. Employees should see the schedule and send
                reminders.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-muted">
                <Bot className="size-3.5 text-accent" aria-hidden="true" />
              </span>
              <div className="rounded-lg rounded-tl-none border border-border-subtle px-4 py-3">
                <p className="text-body-sm text-primary">
                  Got it — online booking with an employee schedule view. Should
                  clients be able to choose a specific veterinarian, or does
                  your team assign one based on availability?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border-subtle px-3 py-1 text-caption text-secondary">
                    Clients choose
                  </span>
                  <span className="rounded-full border border-border-subtle px-3 py-1 text-caption text-secondary">
                    We assign
                  </span>
                  <span className="rounded-full border border-border-subtle px-3 py-1 text-caption text-secondary">
                    Either
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle bg-surface-muted/50 p-6 md:col-span-2 md:border-t-0">
            <p className="text-caption font-semibold tracking-wide text-muted uppercase">
              Business understanding
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "Veterinary clinic, ~8 employees",
                "Online appointment booking",
                "Staff schedule dashboard",
                "Automated appointment reminders",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <span className="text-body-sm text-secondary">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Badge variant="accent">Blueprint 70% ready</Badge>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-caption text-muted">
        Illustration of the Forge discovery interview and live business
        understanding.
      </figcaption>
    </figure>
  );
}

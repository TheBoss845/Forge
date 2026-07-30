import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PrototypePreview } from "@/components/builder/prototype-preview";
import { DownloadExampleButton } from "@/components/marketing/download-example-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EXAMPLE_BLUEPRINT } from "@/features/blueprints/example";
import { getAccountsMode } from "@/lib/utilities/capabilities";
import { cn } from "@/lib/utilities/cn";

export const metadata: Metadata = {
  title: "Example project",
  description:
    "An example of what Forge plans and prototypes from a simple business description.",
};

export default function DemoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="accent">Example project</Badge>
        <h1 className="mt-6 text-display text-primary">
          From one sentence to a working plan
        </h1>
        <p className="mt-4 text-body text-secondary">
          A clinic owner told Forge:{" "}
          <em>
            “I own a veterinary clinic and need customers to book appointments
            online. Employees should see the schedule and send reminders.”
          </em>{" "}
          After a short interview, Forge produced the blueprint behind this
          interactive prototype. Switch roles, click through the pages — this is
          the level of planning every Forge project gets.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <PrototypePreview blueprint={EXAMPLE_BLUEPRINT} />
        <div className="mt-8 text-center">
          <DownloadExampleButton />
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-2xl text-center">
        <h2 className="text-section-title text-primary">
          Your business is next
        </h2>
        <p className="mt-2 text-body-sm text-secondary">
          Describe what you need in plain language. Forge interviews you, plans
          it, and shows you exactly what it will build — before anything gets
          built.
        </p>
        <Link
          href={getAccountsMode() === "none" ? "/try" : "/register"}
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          {getAccountsMode() === "none" ? "Try Forge now" : "Start building"}
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </Container>
  );
}

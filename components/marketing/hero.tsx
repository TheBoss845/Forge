import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { DemoMockup } from "@/components/marketing/demo-mockup";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utilities/cn";

const examplePrompts = [
  "My dental office needs online appointment booking with reminders.",
  "We run a repair shop and need a quoting and job-tracking system.",
  "Our nonprofit needs a volunteer portal with shift scheduling.",
  "I need an inventory dashboard for my three retail stores.",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Restrained decorative layer: faint dot grid + one soft ember glow. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute top-[-12rem] left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
      <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up">
            <Badge variant="accent">
              <Sparkles className="size-3" aria-hidden="true" />
              AI software engineering for every business
            </Badge>
          </div>
          <h1 className="mt-6 animate-fade-up text-display text-primary [animation-delay:80ms] sm:text-[4rem] sm:leading-[1.05]">
            Tell Forge what your business needs.{" "}
            <span className="text-accent">Watch it become software.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-body text-secondary [animation-delay:160ms] sm:text-lg">
            Forge interviews you, designs your system, creates the application,
            and helps you launch it. No development team required.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Start building
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/demo"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              View example project
            </Link>
          </div>

          <div className="mt-10 animate-fade-up [animation-delay:320ms]">
            <p className="text-caption font-medium tracking-wide text-muted uppercase">
              Businesses start with prompts like
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {examplePrompts.map((prompt) => (
                <li
                  key={prompt}
                  className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-body-sm text-secondary"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 animate-fade-up [animation-delay:400ms] sm:mt-20">
          <DemoMockup />
        </div>
      </Container>
    </section>
  );
}

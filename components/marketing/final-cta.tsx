import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utilities/cn";

export function FinalCta({ guestOnly }: { guestOnly: boolean }) {
  return (
    <section className="border-t border-border-subtle bg-surface-muted/40">
      <Container className="py-20 text-center sm:py-24">
        <h2 className="mx-auto max-w-2xl text-page-title text-primary sm:text-[2.5rem] sm:leading-[1.15]">
          Your business already knows what it needs. Tell Forge.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body text-secondary">
          Start with a conversation. Leave with a complete software plan for
          your business — free while Forge is in early access.
        </p>
        <div className="mt-8">
          <Link
            href={guestOnly ? "/try" : "/register"}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {guestOnly ? "Try Forge now" : "Start building"}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

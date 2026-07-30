import type { Metadata } from "next";

import { GuestWorkspace } from "@/components/guest/guest-workspace";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { isAiConfigured } from "@/lib/ai";
import { getAccountsMode } from "@/lib/utilities/capabilities";

export const metadata: Metadata = {
  title: "Try Forge",
  description:
    "Try the full Forge experience without an account: an AI interview, a complete project blueprint, an interactive prototype, and downloadable code.",
};

// AI credentials can be added to the host at any time; check them per
// request instead of baking the build-time answer into a static page.
export const dynamic = "force-dynamic";

export default function TryPage() {
  return (
    <Container className="py-14 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <Badge variant="accent">No account needed</Badge>
        <h1 className="mt-6 text-display text-primary">Try Forge right now</h1>
        <p className="mt-4 text-body text-secondary">
          Tell Forge about your business, answer a few smart questions, and get
          a complete software blueprint, an interactive prototype, and a
          downloadable starter codebase. Your progress stays in this browser.
        </p>
      </div>
      <GuestWorkspace
        aiConfigured={isAiConfigured()}
        accountsMode={getAccountsMode() === "local" ? "local" : "none"}
      />
    </Container>
  );
}

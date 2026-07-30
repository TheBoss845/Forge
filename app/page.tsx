import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const milestones = [
  {
    name: "Project foundation",
    description:
      "Framework, design tokens, light and dark themes, component system, tooling.",
    status: "complete",
  },
  {
    name: "Marketing experience",
    description: "Landing page, product demonstration, example prompts.",
    status: "next",
  },
  {
    name: "Authentication",
    description: "Registration, sign-in, protected routes, user profiles.",
    status: "planned",
  },
  {
    name: "Business onboarding",
    description: "Conversational business profile setup and organizations.",
    status: "planned",
  },
  {
    name: "Project dashboard",
    description: "Project list, statuses, and the new-project flow.",
    status: "planned",
  },
  {
    name: "Discovery interview",
    description: "The AI interview that understands your business.",
    status: "planned",
  },
  {
    name: "Blueprint generation",
    description: "Structured, editable project blueprints.",
    status: "planned",
  },
] as const;

function StatusBadge({
  status,
}: {
  status: (typeof milestones)[number]["status"];
}) {
  if (status === "complete") {
    return <Badge variant="success">Complete</Badge>;
  }
  if (status === "next") {
    return <Badge variant="accent">Up next</Badge>;
  }
  return <Badge variant="neutral">Planned</Badge>;
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="accent">Early development preview</Badge>
            <h1 className="mt-6 text-display text-primary">
              Tell Forge what your business needs. Watch it become software.
            </h1>
            <p className="mt-6 text-body text-secondary">
              Forge will interview you, design your system, create the
              application, and help you launch it. The platform is being built
              in the open, milestone by milestone — here is exactly where it
              stands today.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Build status</CardTitle>
                <CardDescription>
                  Nothing listed here is simulated. Each milestone is marked
                  complete only when it works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border-subtle">
                  {milestones.map((milestone) => (
                    <li
                      key={milestone.name}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-body-sm font-medium text-primary">
                          {milestone.name}
                        </p>
                        <p className="mt-0.5 text-body-sm text-muted">
                          {milestone.description}
                        </p>
                      </div>
                      <StatusBadge status={milestone.status} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

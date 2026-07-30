import { Check } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utilities/cn";

const plans = [
  {
    name: "Starter",
    description: "For exploring what Forge can plan for your business.",
    features: [
      "Limited projects",
      "AI discovery interviews",
      "Blueprint generation",
      "Basic templates",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For businesses ready to generate and launch applications.",
    features: [
      "More projects",
      "Application generation",
      "Version history",
      "Deployment",
      "Higher AI usage limits",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    description: "For teams building and operating software together.",
    features: [
      "Teams and permissions",
      "Shared workspaces",
      "Advanced security",
      "Priority support",
    ],
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Plans that grow with your business"
          description="Forge is in early development. Final pricing has not been announced — these are the planned tiers."
        />
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-lg border bg-surface p-6",
                plan.highlighted
                  ? "border-accent shadow-elevated"
                  : "border-border-subtle shadow-card",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-card-title text-primary">{plan.name}</h3>
                {plan.highlighted ? (
                  <Badge variant="accent">Most popular</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-body-sm text-secondary">
                {plan.description}
              </p>
              <p className="mt-4 text-page-title text-primary">
                TBA
                <span className="text-body-sm font-normal text-muted">
                  {" "}
                  / month
                </span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <span className="text-body-sm text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

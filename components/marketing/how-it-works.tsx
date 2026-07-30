import { ClipboardList, MessageSquareText, Pencil, Rocket } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

const steps = [
  {
    icon: MessageSquareText,
    title: "Describe your business",
    description:
      "Explain what your business does and what slows it down — in plain language. Forge interviews you like a senior consultant, one focused question at a time.",
  },
  {
    icon: ClipboardList,
    title: "Review the blueprint",
    description:
      "Forge produces a complete project blueprint: users, roles, features, pages, data, and workflows — separated into what is essential now and what can wait.",
  },
  {
    icon: Pencil,
    title: "Shape it together",
    description:
      "Edit any section directly or ask Forge to revise it. Nothing gets built until you approve the plan, and every version is saved.",
  },
  {
    icon: Rocket,
    title: "Generate and launch",
    description:
      "Forge turns the approved blueprint into a working application, runs checks, and helps you deploy — then keeps improving it with you.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From conversation to working software"
          description="Forge behaves like a thoughtful software consultancy: it asks before assuming, starts simple, and always shows you the plan."
        />
        <ol className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-border-subtle bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-md bg-accent-muted">
                  <step.icon
                    className="size-5 text-accent"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-caption font-semibold text-muted">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-card-title text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-body-sm text-secondary">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

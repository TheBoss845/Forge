import { KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

const items = [
  {
    icon: Lock,
    title: "Your data stays yours",
    description:
      "Row-level security means every organization can only ever see its own projects, interviews, and blueprints.",
  },
  {
    icon: KeyRound,
    title: "Secrets never reach the browser",
    description:
      "API keys and service credentials live only on the server, in environment variables — never in client code.",
  },
  {
    icon: UserCheck,
    title: "Authorization on every operation",
    description:
      "Every project action is checked against your membership and role. Guessing an ID gets you nothing.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Validated input, sanitized output, rate-limited AI endpoints, and no execution of untrusted generated code.",
  },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="scroll-mt-20 border-y border-border-subtle bg-surface-muted/40 py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="Security"
          title="Built like your business depends on it"
          description="Security is a core feature of Forge, not an afterthought. These guarantees are part of the architecture."
        />
        <ul className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex gap-4 rounded-lg border border-border-subtle bg-surface p-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-muted">
                <item.icon className="size-5 text-accent" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-card-title text-primary">{item.title}</h3>
                <p className="mt-1 text-body-sm text-secondary">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

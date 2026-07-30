import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

const faqs = [
  {
    question: "Do I need to know anything about programming?",
    answer:
      "No. You describe your business and what you need in plain language. Forge asks clarifying questions, shows you the plan in normal words, and handles the technical work.",
  },
  {
    question: "What can Forge build today?",
    answer:
      "Forge interviews you, produces a detailed editable blueprint, renders an interactive prototype of your application, and generates a complete runnable starter codebase from the blueprint — pages, navigation, typed data models, sample data, and a ready-to-apply database schema. You can download it, deploy it, and modify files by asking Forge in plain language. The starter uses clearly-labeled sample data until you connect a database; Forge never pretends a feature exists before it does.",
  },
  {
    question: "Will Forge build whatever I ask for?",
    answer:
      "Forge behaves like a thoughtful consultant, not a vending machine. If a feature adds complexity without helping your business, it will say so and suggest something simpler. You always make the final call.",
  },
  {
    question: "Who owns what Forge creates?",
    answer:
      "You do. Blueprints and generated applications belong to your organization.",
  },
  {
    question: "Is my business data safe?",
    answer:
      "Yes. Every organization's data is isolated with row-level security, secrets never reach the browser, and every operation is authorization-checked. See the Security section above for specifics.",
  },
  {
    question: "What does it cost?",
    answer:
      "Pricing has not been announced yet. The planned tiers are Starter, Pro, and Business — and there will be a way to try Forge before paying.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-border-subtle py-20 sm:py-28"
    >
      <Container>
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mx-auto mt-12 max-w-2xl divide-y divide-border-subtle">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-body font-medium text-primary [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-body-sm text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

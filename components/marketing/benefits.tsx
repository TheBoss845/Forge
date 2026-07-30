import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

const benefits = [
  {
    title: "It asks before it assumes",
    description:
      "Forge interviews you the way a senior consultant would — understanding your business before proposing anything, and never asking the same question twice.",
  },
  {
    title: "It starts with the smallest useful product",
    description:
      "Every blueprint separates what is essential for launch from what can wait, so you get value sooner and avoid paying for complexity you do not need.",
  },
  {
    title: "It tells you the truth",
    description:
      "Forge clearly labels what is fully implemented, what is planned, and what needs your configuration. No demo theater, no pretend features.",
  },
  {
    title: "You stay in control",
    description:
      "Every plan is shown before anything is built. Every section is editable. Every version is saved, and you approve changes before they happen.",
  },
];

export function Benefits() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why Forge"
          title="A development team that works like a consultancy"
        />
        <dl className="mx-auto mt-14 grid max-w-4xl gap-x-12 gap-y-10 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit.title}>
              <dt className="text-card-title text-primary">{benefit.title}</dt>
              <dd className="mt-2 text-body-sm text-secondary">
                {benefit.description}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

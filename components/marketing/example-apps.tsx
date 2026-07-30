import {
  Boxes,
  CalendarCheck,
  ContactRound,
  FileText,
  LayoutDashboard,
  MessagesSquare,
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

const examples = [
  {
    icon: CalendarCheck,
    name: "Appointment booking",
    audience: "Clinics, salons, studios, repair shops",
    description:
      "Customers book online, staff manage the schedule, and reminders go out automatically.",
  },
  {
    icon: ContactRound,
    name: "Customer portal",
    audience: "Agencies, law firms, property managers",
    description:
      "A secure place for clients to see documents, invoices, project status, and messages.",
  },
  {
    icon: Boxes,
    name: "Inventory dashboard",
    audience: "Retail, manufacturing, warehouses",
    description:
      "Track stock across locations, get low-stock alerts, and see what actually sells.",
  },
  {
    icon: LayoutDashboard,
    name: "Lead management",
    audience: "Contractors, real-estate teams, consultants",
    description:
      "Capture leads from your website, assign follow-ups, and never lose a deal in a spreadsheet.",
  },
  {
    icon: FileText,
    name: "Document workflows",
    audience: "Accounting, HR, operations teams",
    description:
      "Collect, approve, and organize documents with clear status at every step.",
  },
  {
    icon: MessagesSquare,
    name: "Knowledge assistant",
    audience: "Internal teams of any size",
    description:
      "An AI assistant that answers employee questions from your own policies and procedures.",
  },
];

export function ExampleApps() {
  return (
    <section
      id="examples"
      className="scroll-mt-20 border-y border-border-subtle bg-surface-muted/40 py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="What Forge builds"
          title="Software your business actually needs"
          description="Forge focuses on the systems small and medium businesses ask for most — built around your data, your roles, and your way of working."
        />
        <ul className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <li
              key={example.name}
              className="rounded-lg border border-border-subtle bg-surface p-6 shadow-card"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-accent-muted">
                <example.icon
                  className="size-5 text-accent"
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-4 text-card-title text-primary">
                {example.name}
              </h3>
              <p className="mt-1 text-caption font-medium text-muted">
                {example.audience}
              </p>
              <p className="mt-2 text-body-sm text-secondary">
                {example.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

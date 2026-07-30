import {
  projectBlueprintSchema,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";

/**
 * A realistic example blueprint (validated at module load) used by the
 * public demo page. This is clearly presented as an example, not a promise.
 */
export const EXAMPLE_BLUEPRINT: ProjectBlueprint = projectBlueprintSchema.parse(
  {
    projectName: "Northside Vet Booking",
    oneSentenceSummary:
      "Online appointment booking and schedule management for a neighborhood veterinary clinic.",
    businessContext: {
      industry: "Veterinary",
      businessDescription:
        "A family-run veterinary clinic with two vets and a front-desk team, serving about 60 appointments a week.",
      currentProblem:
        "All bookings happen by phone. The front desk spends hours a day on scheduling calls, and no-shows are common because reminders are manual.",
      desiredOutcome:
        "Customers book online day or night, staff see one live schedule, and reminders go out automatically.",
    },
    users: [
      {
        name: "Pet owner",
        description: "A customer booking and managing visits for their pet.",
        goals: [
          "Book an appointment in under two minutes",
          "Get a reminder before the visit",
          "Cancel or reschedule without calling",
        ],
      },
      {
        name: "Front desk",
        description: "Staff managing the daily schedule and customer records.",
        goals: [
          "See the whole day at a glance",
          "Update appointment status quickly",
          "Reach customers about changes",
        ],
      },
      {
        name: "Veterinarian",
        description: "A vet reviewing their day and patient details.",
        goals: [
          "See today's appointments",
          "Read visit notes before entering the room",
        ],
      },
    ],
    roles: [
      {
        name: "Customer",
        permissions: ["Book, view, cancel own appointments"],
      },
      {
        name: "Staff",
        permissions: [
          "View and manage the full schedule",
          "Update appointment status",
          "Manage customer and pet records",
        ],
      },
      {
        name: "Admin",
        permissions: [
          "Everything staff can do",
          "Manage services, hours, and team accounts",
        ],
      },
    ],
    coreFeatures: [
      {
        name: "Online booking",
        description:
          "Customers choose a service, a vet (or first available), and an open time slot.",
        priority: "essential",
        acceptanceCriteria: [
          "Only open slots can be selected",
          "A confirmation email is sent immediately",
        ],
      },
      {
        name: "Staff schedule dashboard",
        description:
          "A live view of the day and week, with appointment status updates.",
        priority: "essential",
        acceptanceCriteria: [
          "Staff can mark appointments confirmed, arrived, completed, or no-show",
        ],
      },
      {
        name: "Automatic reminders",
        description: "Email reminders 24 hours before each appointment.",
        priority: "recommended",
        acceptanceCriteria: ["Reminders stop if the appointment is cancelled"],
      },
      {
        name: "Online payments",
        description: "Take deposits at booking time to reduce no-shows.",
        priority: "optional",
        acceptanceCriteria: [],
      },
    ],
    pages: [
      {
        name: "Book a visit",
        route: "/book",
        purpose: "Customers pick a service, time, and vet, then confirm.",
        allowedRoles: ["Customer"],
        components: ["Booking form", "Availability calendar"],
      },
      {
        name: "My appointments",
        route: "/appointments",
        purpose: "Customers see upcoming visits and can cancel or reschedule.",
        allowedRoles: ["Customer"],
        components: ["Appointments list", "Cancel and reschedule actions"],
      },
      {
        name: "Schedule",
        route: "/schedule",
        purpose: "Staff manage the live schedule for the whole clinic.",
        allowedRoles: ["Staff", "Admin"],
        components: [
          "Day and week calendar",
          "Appointments table",
          "Status update actions",
        ],
      },
      {
        name: "Customers",
        route: "/customers",
        purpose: "Staff look up customers and their pets.",
        allowedRoles: ["Staff", "Admin"],
        components: ["Customer records table", "Add customer form"],
      },
      {
        name: "Reports",
        route: "/reports",
        purpose: "Admins see bookings, no-show rates, and busy hours.",
        allowedRoles: ["Admin"],
        components: ["Booking stats overview cards", "No-show rate chart"],
      },
    ],
    dataModels: [
      {
        name: "Appointment",
        description: "A scheduled visit for one pet.",
        fields: [
          { name: "Pet name", type: "text", required: true, description: "" },
          {
            name: "Owner email",
            type: "email",
            required: true,
            description: "",
          },
          {
            name: "Service",
            type: "enum",
            required: true,
            description: "Checkup, vaccination, surgery, grooming",
          },
          {
            name: "Date and time",
            type: "datetime",
            required: true,
            description: "",
          },
          {
            name: "Status",
            type: "enum",
            required: true,
            description: "Booked, confirmed, arrived, completed, no-show",
          },
          { name: "Notes", type: "text", required: false, description: "" },
        ],
        relationships: ["Belongs to a Customer", "Assigned to a Veterinarian"],
      },
      {
        name: "Customer",
        description: "A pet owner with contact details.",
        fields: [
          { name: "Name", type: "text", required: true, description: "" },
          { name: "Email", type: "email", required: true, description: "" },
          { name: "Phone", type: "phone", required: false, description: "" },
        ],
        relationships: ["Has many Pets", "Has many Appointments"],
      },
      {
        name: "Pet",
        description: "An animal belonging to a customer.",
        fields: [
          { name: "Name", type: "text", required: true, description: "" },
          {
            name: "Species",
            type: "enum",
            required: true,
            description: "Dog, cat, other",
          },
          {
            name: "Date of birth",
            type: "date",
            required: false,
            description: "",
          },
        ],
        relationships: ["Belongs to a Customer"],
      },
    ],
    workflows: [
      {
        name: "New booking",
        trigger: "A customer completes the booking form",
        steps: [
          "Reserve the time slot",
          "Send a confirmation email to the customer",
          "Show the appointment on the staff schedule",
          "Queue a reminder for 24 hours before the visit",
        ],
        result: "The appointment is booked and everyone is informed.",
      },
      {
        name: "No-show follow-up",
        trigger: "Staff mark an appointment as a no-show",
        steps: [
          "Record the no-show on the customer's history",
          "Send a friendly rebooking email",
        ],
        result: "The customer is invited to rebook without staff effort.",
      },
    ],
    integrations: [
      {
        name: "Email delivery (e.g. Resend)",
        purpose: "Confirmations and reminders",
        required: true,
      },
      {
        name: "Payments (e.g. Stripe)",
        purpose: "Optional deposits at booking",
        required: false,
      },
    ],
    aiFeatures: [],
    securityRequirements: [
      "Customers can only see their own pets and appointments",
      "Staff accounts require sign-in; roles limit what each person can do",
      "Customer contact details are never exposed publicly",
    ],
    assumptions: [
      "The clinic keeps its existing patient medical records system",
      "Two treatment rooms limit parallel bookings",
    ],
    openQuestions: [
      "Should customers be able to choose a specific vet, or is first-available fine?",
    ],
    mvpScope: [
      "Online booking with live availability",
      "Staff schedule dashboard with status updates",
      "Email confirmations",
    ],
    futureRoadmap: [
      "Automatic reminders",
      "Deposits with Stripe",
      "Waitlist for full days",
      "Reports for admins",
    ],
  },
);

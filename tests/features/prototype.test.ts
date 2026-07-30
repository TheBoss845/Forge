import { describe, expect, it } from "vitest";

import { projectBlueprintSchema } from "@/features/blueprints/schema";
import {
  classifyComponent,
  inputTypeForField,
  matchDataModel,
  sampleValueForField,
  visiblePages,
} from "@/features/generation/prototype";

const blueprint = projectBlueprintSchema.parse({
  projectName: "Clinic Booking",
  oneSentenceSummary: "Online booking.",
  businessContext: {
    industry: "Veterinary",
    businessDescription: "Clinic",
    currentProblem: "Phones",
    desiredOutcome: "Online",
  },
  roles: [{ name: "Admin" }, { name: "Customer" }],
  pages: [
    {
      name: "Book appointment",
      route: "/book",
      purpose: "Customers book a visit",
      allowedRoles: ["Customer"],
      components: ["Booking form", "Availability calendar"],
    },
    {
      name: "Schedule",
      route: "/schedule",
      purpose: "Staff see appointments",
      allowedRoles: ["Admin"],
      components: ["Appointments table"],
    },
    {
      name: "Home",
      route: "/",
      purpose: "Public landing",
      allowedRoles: [],
      components: [],
    },
  ],
  dataModels: [
    {
      name: "Appointment",
      description: "A booked visit",
      fields: [
        { name: "Pet name", type: "text", required: true, description: "" },
        { name: "Email", type: "email", required: true, description: "" },
        { name: "Date", type: "date", required: true, description: "" },
        {
          name: "Confirmed",
          type: "boolean",
          required: false,
          description: "",
        },
      ],
      relationships: [],
    },
    {
      name: "Customer",
      description: "A pet owner",
      fields: [{ name: "Name", type: "text", required: true, description: "" }],
      relationships: [],
    },
  ],
});

describe("visiblePages", () => {
  it("filters pages by role, case-insensitively", () => {
    const pages = visiblePages(blueprint, "customer");
    expect(pages.map((page) => page.name)).toEqual([
      "Book appointment",
      "Home",
    ]);
  });

  it("shows unrestricted pages to every role", () => {
    const pages = visiblePages(blueprint, "Admin");
    expect(pages.map((page) => page.name)).toEqual(["Schedule", "Home"]);
  });

  it("shows everything when there is no role", () => {
    expect(visiblePages(blueprint, null)).toHaveLength(3);
  });
});

describe("classifyComponent", () => {
  it("detects forms, tables, calendars, and stats", () => {
    expect(classifyComponent("Booking form")).toBe("form");
    expect(classifyComponent("Appointments table")).toBe("table");
    expect(classifyComponent("Availability calendar")).toBe("calendar");
    expect(classifyComponent("Revenue chart")).toBe("stats");
    expect(classifyComponent("Export buttons")).toBe("actions");
    expect(classifyComponent("Welcome banner")).toBe("generic");
  });
});

describe("matchDataModel", () => {
  it("matches the appointments model to the schedule page", () => {
    const model = matchDataModel(blueprint, blueprint.pages[1]);
    expect(model?.name).toBe("Appointment");
  });

  it("prefers page-name matches over purpose-text matches", () => {
    // "Book appointment" page mentions "Customers" only in its purpose;
    // the Appointment model must still win via the page name.
    const model = matchDataModel(blueprint, blueprint.pages[0]);
    expect(model?.name).toBe("Appointment");
  });

  it("matches through model descriptions", () => {
    const visitPage = {
      name: "Book a visit",
      route: "/book",
      purpose: "Customers pick a time",
      allowedRoles: [],
      components: ["Booking form"],
    };
    const withDescription = {
      ...blueprint,
      dataModels: [
        blueprint.dataModels[1],
        {
          ...blueprint.dataModels[0],
          name: "Appointment",
          description: "A scheduled visit",
        },
      ],
    };
    const model = matchDataModel(withDescription, visitPage);
    expect(model?.name).toBe("Appointment");
  });

  it("returns null when there are no models", () => {
    const empty = { ...blueprint, dataModels: [] };
    expect(matchDataModel(empty, blueprint.pages[0])).toBeNull();
  });
});

describe("field rendering helpers", () => {
  it("maps field types to input types", () => {
    expect(inputTypeForField({ name: "Email", type: "email" })).toBe("email");
    expect(inputTypeForField({ name: "Date", type: "date" })).toBe("date");
    expect(inputTypeForField({ name: "Confirmed", type: "boolean" })).toBe(
      "checkbox",
    );
    expect(inputTypeForField({ name: "Status", type: "enum" })).toBe("select");
  });

  it("produces plausible sample values", () => {
    expect(sampleValueForField({ name: "Email", type: "email" })).toContain(
      "@",
    );
    expect(sampleValueForField({ name: "Price", type: "number" })).toContain(
      "$",
    );
    expect(sampleValueForField({ name: "Confirmed", type: "boolean" })).toBe(
      "Yes",
    );
  });
});

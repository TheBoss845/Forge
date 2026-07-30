import { describe, expect, it } from "vitest";

import {
  projectBlueprintSchema,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import {
  applySectionValue,
  getSectionValue,
} from "@/features/blueprints/sections";

const minimalBlueprint = {
  projectName: "Clinic Booking",
  oneSentenceSummary: "Online booking for a veterinary clinic.",
  businessContext: {
    industry: "Veterinary",
    businessDescription: "A small clinic.",
    currentProblem: "Phone-only booking.",
    desiredOutcome: "Customers book online.",
  },
};

describe("projectBlueprintSchema", () => {
  it("accepts a minimal blueprint and applies defaults", () => {
    const result = projectBlueprintSchema.safeParse(minimalBlueprint);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users).toEqual([]);
      expect(result.data.coreFeatures).toEqual([]);
      expect(result.data.openQuestions).toEqual([]);
    }
  });

  it("accepts a full feature entry with priority", () => {
    const result = projectBlueprintSchema.safeParse({
      ...minimalBlueprint,
      coreFeatures: [
        {
          name: "Online booking",
          description: "Customers pick a time slot.",
          priority: "essential",
          acceptanceCriteria: ["A booking can be created"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid feature priority", () => {
    const result = projectBlueprintSchema.safeParse({
      ...minimalBlueprint,
      coreFeatures: [
        {
          name: "Online booking",
          description: "Customers pick a time slot.",
          priority: "critical",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a blueprint without a project name", () => {
    const invalid: Record<string, unknown> = { ...minimalBlueprint };
    delete invalid.projectName;
    expect(projectBlueprintSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("blueprint sections", () => {
  const blueprint = projectBlueprintSchema.parse(
    minimalBlueprint,
  ) as ProjectBlueprint;

  it("extracts and reapplies the overview section", () => {
    const overview = getSectionValue(blueprint, "overview") as {
      projectName: string;
    };
    expect(overview.projectName).toBe("Clinic Booking");

    const updated = applySectionValue(blueprint, "overview", {
      ...overview,
      projectName: "Renamed",
    });
    expect(updated.projectName).toBe("Renamed");
    expect(updated.businessContext.industry).toBe("Veterinary");
  });

  it("replaces an array section immutably", () => {
    const updated = applySectionValue(blueprint, "mvpScope", [
      "Launch booking",
    ]);
    expect(updated.mvpScope).toEqual(["Launch booking"]);
    expect(blueprint.mvpScope).toEqual([]);
  });
});

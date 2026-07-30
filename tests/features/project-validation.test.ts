import { describe, expect, it } from "vitest";

import {
  deriveProjectName,
  newProjectSchema,
} from "@/features/projects/validation";

describe("newProjectSchema", () => {
  it("accepts a reasonable prompt", () => {
    expect(
      newProjectSchema.safeParse({
        prompt: "I need an online booking system for my dental office.",
      }).success,
    ).toBe(true);
  });

  it("rejects prompts that are too short", () => {
    expect(newProjectSchema.safeParse({ prompt: "an app" }).success).toBe(
      false,
    );
  });
});

describe("deriveProjectName", () => {
  it("uses the first words of the prompt", () => {
    expect(
      deriveProjectName("I need an online booking system for my dental office"),
    ).toBe("I need an online booking system for my");
  });

  it("collapses whitespace", () => {
    expect(deriveProjectName("Booking   system\n\nfor clinics")).toBe(
      "Booking system for clinics",
    );
  });
});

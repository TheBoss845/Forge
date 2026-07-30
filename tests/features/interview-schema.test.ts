import { describe, expect, it } from "vitest";

import { interviewTurnSchema } from "@/features/interviews/schema";

describe("interviewTurnSchema", () => {
  it("accepts a complete turn", () => {
    const result = interviewTurnSchema.safeParse({
      message: "Who will use this system?",
      whyThisMatters: "It shapes the roles.",
      suggestedAnswers: ["Customers", "Employees"],
      discoveryComplete: false,
      updatedSummary: {
        knownFacts: ["Vet clinic"],
        openTopics: ["Payments"],
        progressPercent: 30,
      },
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const result = interviewTurnSchema.safeParse({
      message: "Question?",
      updatedSummary: { progressPercent: 10 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.suggestedAnswers).toEqual([]);
      expect(result.data.discoveryComplete).toBe(false);
      expect(result.data.updatedSummary.knownFacts).toEqual([]);
    }
  });

  it("rejects an empty message", () => {
    const result = interviewTurnSchema.safeParse({
      message: "",
      updatedSummary: { knownFacts: [], openTopics: [], progressPercent: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects progress outside 0-100", () => {
    const result = interviewTurnSchema.safeParse({
      message: "Q",
      updatedSummary: { knownFacts: [], openTopics: [], progressPercent: 150 },
    });
    expect(result.success).toBe(false);
  });
});

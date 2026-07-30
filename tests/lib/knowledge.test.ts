import { describe, expect, it } from "vitest";

import {
  findIndustryPlaybook,
  INDUSTRY_PLAYBOOKS,
} from "@/lib/ai/knowledge/industries";
import { APP_PATTERNS, detectPatterns } from "@/lib/ai/knowledge/patterns";
import {
  buildBlueprintKnowledge,
  buildInterviewKnowledge,
} from "@/lib/ai/knowledge/select";
import { INDUSTRIES } from "@/features/organizations/validation";

describe("industry playbooks", () => {
  it("covers every onboarding industry", () => {
    for (const industry of INDUSTRIES) {
      const playbook = findIndustryPlaybook(industry, "");
      expect(playbook, industry).toBeDefined();
      // Every industry should resolve to a specific playbook, or Other.
      expect(playbook.mustAskQuestions.length).toBeGreaterThan(0);
      expect(playbook.pitfalls.length).toBeGreaterThan(0);
    }
  });

  it("has substantive content in every playbook", () => {
    for (const playbook of INDUSTRY_PLAYBOOKS) {
      expect(playbook.commonUsers.length, playbook.industry).toBeGreaterThan(1);
      expect(playbook.security.length, playbook.industry).toBeGreaterThan(0);
      expect(playbook.successMetrics.length, playbook.industry).toBeGreaterThan(
        0,
      );
    }
  });

  it("matches by exact industry name", () => {
    expect(findIndustryPlaybook("Veterinary", "").industry).toBe("Veterinary");
    expect(findIndustryPlaybook("Legal", "").industry).toBe("Legal");
  });

  it("matches by alias in free text", () => {
    expect(
      findIndustryPlaybook("Other", "I run a small yoga studio").industry,
    ).toBe("Fitness & wellness");
    expect(
      findIndustryPlaybook(null, "we are plumbers doing house calls").industry,
    ).toBe("Repair & maintenance");
  });

  it("falls back to Other for unknown businesses", () => {
    expect(
      findIndustryPlaybook("Something odd", "we juggle for parties").industry,
    ).toBe("Other");
  });
});

describe("pattern detection", () => {
  it("detects booking systems", () => {
    const patterns = detectPatterns(
      "customers should book appointments online",
    );
    expect(patterns[0]?.id).toBe("booking");
  });

  it("detects quoting and inventory", () => {
    expect(detectPatterns("track job quotes and estimates")[0]?.id).toBe(
      "quoting",
    );
    expect(
      detectPatterns("inventory dashboard with low stock alerts")[0]?.id,
    ).toBe("inventory");
  });

  it("returns at most two patterns", () => {
    const patterns = detectPatterns(
      "booking appointments, inventory stock, support tickets, lead pipeline",
    );
    expect(patterns.length).toBeLessThanOrEqual(2);
  });

  it("returns nothing for unmatched text", () => {
    expect(detectPatterns("hello world")).toEqual([]);
  });

  it("every pattern has substantive content", () => {
    for (const pattern of APP_PATTERNS) {
      expect(pattern.essentialFeatures.length, pattern.id).toBeGreaterThan(2);
      expect(pattern.dataModels.length, pattern.id).toBeGreaterThan(1);
      expect(pattern.pitfalls.length, pattern.id).toBeGreaterThan(1);
    }
  });
});

describe("knowledge composition", () => {
  it("builds interview knowledge with playbook and craft", () => {
    const block = buildInterviewKnowledge({
      industry: "Veterinary",
      requestText: "book appointments online for our clinic",
    });
    expect(block).toContain("INDUSTRY EXPERTISE: VETERINARY");
    expect(block).toContain("Appointment & booking system");
    expect(block).toContain("WORKED EXAMPLES OF QUESTION CRAFT");
  });

  it("builds blueprint knowledge with entities and modeling guide", () => {
    const block = buildBlueprintKnowledge({
      industry: "Retail",
      requestText: "inventory tracking with low stock alerts",
    });
    expect(block).toContain("INDUSTRY EXPERTISE: RETAIL");
    expect(block).toContain("PATTERN: INVENTORY MANAGEMENT");
    expect(block).toContain("DATA-MODELING QUICK REFERENCE");
  });
});

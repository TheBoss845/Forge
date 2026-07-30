import { describe, expect, it } from "vitest";

import { buildBlueprintSystemPrompt } from "@/features/blueprints/prompts";
import { buildDiscoverySystemPrompt } from "@/features/interviews/prompts";
import type { OrganizationRow, ProjectRow } from "@/types/database";

const organization = {
  id: "org-1",
  name: "Test Clinic",
  slug: "test-clinic",
  description: "A clinic",
  industry: "Veterinary",
  team_size: "2–5 people",
  location: null,
  main_customer_type: "Pet owners",
  current_tools: null,
  biggest_problem: "Phone bookings",
  desired_outcome: "Online bookings",
  created_by: "user-1",
  created_at: "",
  updated_at: "",
} satisfies OrganizationRow;

const project = {
  id: "project-1",
  organization_id: "org-1",
  name: "Booking",
  slug: "booking",
  description: null,
  status: "discovery",
  industry: "Veterinary",
  original_prompt: "I need online booking",
  active_blueprint_version_id: null,
  created_by: "user-1",
  created_at: "",
  updated_at: "",
} satisfies ProjectRow;

describe("discovery prompt", () => {
  it("grounds the agent in the business and enforces one question per turn", () => {
    const prompt = buildDiscoverySystemPrompt({
      organization,
      project,
      summary: null,
    });
    expect(prompt).toContain("Test Clinic");
    expect(prompt).toContain("I need online booking");
    expect(prompt).toContain("ONE question per turn");
    expect(prompt).toContain("discoveryComplete");
  });

  it("injects known facts so questions are never repeated", () => {
    const prompt = buildDiscoverySystemPrompt({
      organization,
      project,
      summary: {
        knownFacts: ["Customers choose their own vet"],
        openTopics: ["Payments"],
        progressPercent: 40,
      },
    });
    expect(prompt).toContain("Customers choose their own vet");
    expect(prompt).toContain("never re-ask");
  });
});

describe("blueprint prompt", () => {
  it("includes the transcript and the honesty rules", () => {
    const prompt = buildBlueprintSystemPrompt({
      organization,
      project,
      transcript: [
        { role: "assistant", content: "Who will use it?" },
        { role: "user", content: "Customers and staff" },
      ],
    });
    expect(prompt).toContain("Customers and staff");
    expect(prompt).toContain("Never invent facts");
    expect(prompt).toContain('"essential"|"recommended"|"optional"');
    expect(prompt).toContain("mvpScope");
  });
});

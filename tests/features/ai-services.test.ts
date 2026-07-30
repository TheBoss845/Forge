import { describe, expect, it } from "vitest";

import { generateBlueprint } from "@/features/blueprints/service";
import { generateInterviewTurn } from "@/features/interviews/service";
import type { AiProvider, CompletionRequest } from "@/lib/ai/types";
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

const validTurn = JSON.stringify({
  message: "Who will use this?",
  suggestedAnswers: ["Customers"],
  discoveryComplete: false,
  updatedSummary: { knownFacts: [], openTopics: [], progressPercent: 10 },
});

const validBlueprint = JSON.stringify({
  projectName: "Clinic Booking",
  oneSentenceSummary: "Online booking.",
  businessContext: {
    industry: "Veterinary",
    businessDescription: "Clinic",
    currentProblem: "Phones",
    desiredOutcome: "Online",
  },
});

function fakeProvider(responses: string[]): {
  provider: AiProvider;
  requests: CompletionRequest[];
} {
  const requests: CompletionRequest[] = [];
  let call = 0;
  return {
    requests,
    provider: {
      name: "fake",
      model: "fake-model",
      complete(request) {
        requests.push(request);
        const text = responses[Math.min(call, responses.length - 1)];
        call += 1;
        return Promise.resolve({
          text,
          inputTokens: 10,
          outputTokens: 20,
          provider: "fake",
          model: "fake-model",
        });
      },
    },
  };
}

describe("generateInterviewTurn", () => {
  it("returns a validated turn on the first attempt", async () => {
    const { provider, requests } = fakeProvider([validTurn]);
    const outcome = await generateInterviewTurn(provider, {
      organization,
      project,
      summary: null,
      transcript: [],
    });
    expect(outcome.turn.message).toBe("Who will use this?");
    expect(outcome.usage).toHaveLength(1);
    expect(requests[0].jsonMode).toBe(true);
  });

  it("repairs invalid output on the second attempt", async () => {
    const { provider } = fakeProvider(["not json at all", validTurn]);
    const outcome = await generateInterviewTurn(provider, {
      organization,
      project,
      summary: null,
      transcript: [{ role: "user", content: "Hello" }],
    });
    expect(outcome.turn.message).toBe("Who will use this?");
    expect(outcome.usage).toHaveLength(2);
  });

  it("throws when repair also fails", async () => {
    const { provider } = fakeProvider(["bad", "still bad"]);
    await expect(
      generateInterviewTurn(provider, {
        organization,
        project,
        summary: null,
        transcript: [],
      }),
    ).rejects.toThrow();
  });
});

describe("generateBlueprint", () => {
  it("returns a validated blueprint including fenced JSON", async () => {
    const { provider } = fakeProvider(["```json\n" + validBlueprint + "\n```"]);
    const outcome = await generateBlueprint(provider, {
      organization,
      project,
      transcript: [],
    });
    expect(outcome.blueprint.projectName).toBe("Clinic Booking");
    expect(outcome.blueprint.users).toEqual([]);
  });

  it("includes the business context in the prompt", async () => {
    const { provider, requests } = fakeProvider([validBlueprint]);
    await generateBlueprint(provider, {
      organization,
      project,
      transcript: [],
    });
    expect(requests[0].system).toContain("Test Clinic");
    expect(requests[0].system).toContain("I need online booking");
  });
});

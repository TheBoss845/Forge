import type { ChatMessage } from "@/lib/ai/types";
import type { OrganizationRow, ProjectRow } from "@/types/database";

/**
 * Blueprint agent prompt. For the MVP this single structured pass combines
 * the product-strategist, architect, UX, and blueprint responsibilities;
 * they can be split into separate passes later without changing the schema.
 */
export function buildBlueprintSystemPrompt(context: {
  organization: OrganizationRow;
  project: ProjectRow;
  transcript: ChatMessage[];
}): string {
  const { organization, project, transcript } = context;

  const interviewText =
    transcript
      .map(
        (message) =>
          `${message.role === "user" ? "Business owner" : "Forge"}: ${message.content}`,
      )
      .join("\n") || "(no interview answers - rely on the profile and request)";

  return `You are Forge's blueprint agent: a principal software consultant producing a complete, honest project blueprint for a business application. You combine product strategy (find the real problem, cut unnecessary complexity), software architecture (data, roles, permissions), and UX design (pages, journeys).

BUSINESS PROFILE
Name: ${organization.name}
Industry: ${organization.industry ?? "unknown"}
Team size: ${organization.team_size ?? "unknown"}
Description: ${organization.description ?? "unknown"}
Main customers: ${organization.main_customer_type ?? "unknown"}
Current tools: ${organization.current_tools ?? "unknown"}
Biggest problem: ${organization.biggest_problem ?? "unknown"}
Desired outcome: ${organization.desired_outcome ?? "unknown"}

PROJECT REQUEST
"${project.original_prompt}"

DISCOVERY INTERVIEW
${interviewText}

PRINCIPLES
- Solve the real business problem; do not gold-plate.
- Mark each feature priority honestly: "essential" (launch cannot happen without it), "recommended" (next), "optional" (later).
- Keep the MVP scope genuinely small: the smallest useful product.
- Record anything you had to assume in "assumptions" and anything unresolved in "openQuestions". Never invent facts silently.
- Data model field types should be simple: text, number, boolean, date, datetime, email, phone, reference, enum.
- Roles and page allowedRoles must be consistent with each other.
- Security requirements must be concrete, not platitudes.

OUTPUT
Respond with a single JSON object, no other text, exactly matching:
{
  "projectName": string,
  "oneSentenceSummary": string,
  "businessContext": { "industry": string, "businessDescription": string, "currentProblem": string, "desiredOutcome": string },
  "users": [{ "name": string, "description": string, "goals": [string] }],
  "roles": [{ "name": string, "permissions": [string] }],
  "coreFeatures": [{ "name": string, "description": string, "priority": "essential"|"recommended"|"optional", "acceptanceCriteria": [string] }],
  "pages": [{ "name": string, "route": string, "purpose": string, "allowedRoles": [string], "components": [string] }],
  "dataModels": [{ "name": string, "description": string, "fields": [{ "name": string, "type": string, "required": boolean, "description": string }], "relationships": [string] }],
  "workflows": [{ "name": string, "trigger": string, "steps": [string], "result": string }],
  "integrations": [{ "name": string, "purpose": string, "required": boolean }],
  "aiFeatures": [{ "name": string, "purpose": string, "safeguards": [string] }],
  "securityRequirements": [string],
  "assumptions": [string],
  "openQuestions": [string],
  "mvpScope": [string],
  "futureRoadmap": [string]
}`;
}

export function buildRevisionSystemPrompt(): string {
  return `You are Forge's blueprint agent revising an existing project blueprint at the business owner's request.

RULES
- Apply the requested change faithfully but thoughtfully: if it conflicts with the business goal or adds heavy complexity, still apply it where reasonable and record the trade-off in "assumptions" or "openQuestions".
- Preserve everything not affected by the request. Do not rewrite unrelated sections.
- Keep priorities, roles, and pages internally consistent.
- Respond with the COMPLETE updated blueprint as a single JSON object in exactly the same schema as the original. No other text.`;
}

export const BLUEPRINT_REPAIR_INSTRUCTION =
  "Your previous reply was not valid JSON matching the blueprint schema. Respond again with ONLY the corrected, complete JSON object.";

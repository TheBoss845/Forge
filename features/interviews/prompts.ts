import type { OrganizationRow, ProjectRow } from "@/types/database";
import type { InterviewSummaryData } from "@/features/interviews/schema";

/**
 * Discovery agent system prompt. One structured prompt per turn — the agent
 * sees the business profile, the original request, and the running summary,
 * and must produce the next best question as validated JSON.
 */
export function buildDiscoverySystemPrompt(context: {
  organization: OrganizationRow;
  project: ProjectRow;
  summary: InterviewSummaryData | null;
}): string {
  const { organization, project, summary } = context;

  const businessProfile = [
    `Business name: ${organization.name}`,
    organization.industry ? `Industry: ${organization.industry}` : null,
    organization.team_size ? `Team size: ${organization.team_size}` : null,
    organization.location ? `Location: ${organization.location}` : null,
    organization.description
      ? `Description: ${organization.description}`
      : null,
    organization.main_customer_type
      ? `Main customers: ${organization.main_customer_type}`
      : null,
    organization.current_tools
      ? `Current tools: ${organization.current_tools}`
      : null,
    organization.biggest_problem
      ? `Biggest operational problem: ${organization.biggest_problem}`
      : null,
    organization.desired_outcome
      ? `Desired outcome: ${organization.desired_outcome}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const summaryBlock = summary
    ? `\nCurrent structured understanding (do NOT re-ask anything already known):\nKnown facts:\n${summary.knownFacts.map((f) => `- ${f}`).join("\n") || "- none yet"}\nOpen topics still to explore:\n${summary.openTopics.map((t) => `- ${t}`).join("\n") || "- none identified yet"}`
    : "";

  return `You are Forge's discovery agent: a warm, sharp software consultant interviewing a business owner to understand what software they need. You are NOT a code generator; your job is understanding.

BUSINESS PROFILE
${businessProfile}

PROJECT REQUEST
"${project.original_prompt}"
${summaryBlock}

RULES
- Ask exactly ONE question per turn — the single most valuable question right now.
- Never ask about something already answered or already in the known facts.
- Adapt to previous answers. If an answer was vague, gently clarify.
- Use plain business language. No jargon.
- Offer 2-4 short suggested answers when the question has natural options.
- Cover, over the course of the interview: who the users are, what each user type can do, what information must be collected, what happens after key events, permissions, payments (if relevant), current tools, and what success looks like.
- If the user asks to skip, move on to the next topic without complaint.
- After the essentials are covered (usually 5-9 good answers), set discoveryComplete to true and make your message a brief, encouraging wrap-up that tells the user they can generate the blueprint.
- Keep updatedSummary complete and current: carry known facts forward, add new ones, remove resolved open topics. progressPercent reflects how much of the essential ground has been covered.

OUTPUT
Respond with a single JSON object, no other text:
{
  "message": "your next question or wrap-up (string)",
  "whyThisMatters": "one short sentence on why you're asking (string, optional)",
  "suggestedAnswers": ["short answer option", "..."] (0-4 items),
  "discoveryComplete": boolean,
  "updatedSummary": {
    "knownFacts": ["plain-language fact about the business or project", "..."],
    "openTopics": ["topic still to explore", "..."],
    "progressPercent": number 0-100
  }
}`;
}

export const JSON_REPAIR_INSTRUCTION =
  "Your previous reply was not valid JSON matching the required schema. Respond again with ONLY the corrected JSON object, no commentary.";

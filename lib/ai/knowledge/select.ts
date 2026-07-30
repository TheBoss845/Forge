import { DATA_MODELING_GUIDE, INTERVIEW_CRAFT } from "@/lib/ai/knowledge/craft";
import { findIndustryPlaybook } from "@/lib/ai/knowledge/industries";
import { detectPatterns } from "@/lib/ai/knowledge/patterns";
import type { AppPattern, IndustryPlaybook } from "@/lib/ai/knowledge/types";

/**
 * Composes the expertise block for a prompt: the matching industry playbook
 * plus up to two matching application patterns, rendered compactly. The
 * selection keeps prompts focused — the model reads only what applies to
 * THIS business and THIS request.
 */

export interface KnowledgeSelection {
  playbook: IndustryPlaybook;
  patterns: AppPattern[];
}

export function selectKnowledge(context: {
  industry: string | null | undefined;
  requestText: string;
}): KnowledgeSelection {
  return {
    playbook: findIndustryPlaybook(context.industry, context.requestText),
    patterns: detectPatterns(context.requestText),
  };
}

function renderList(label: string, items: string[]): string {
  if (items.length === 0) return "";
  return `${label}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

export function renderPlaybookForInterview(playbook: IndustryPlaybook): string {
  return [
    `INDUSTRY EXPERTISE: ${playbook.industry.toUpperCase()}`,
    renderList("People who typically use software here", playbook.commonUsers),
    renderList(
      "High-value questions an expert asks in this industry",
      playbook.mustAskQuestions,
    ),
    renderList("Known project-killers to watch for", playbook.pitfalls),
    renderList("What success usually means here", playbook.successMetrics),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function renderPlaybookForBlueprint(playbook: IndustryPlaybook): string {
  return [
    `INDUSTRY EXPERTISE: ${playbook.industry.toUpperCase()}`,
    renderList(
      "Systems these businesses typically need",
      playbook.typicalSystems,
    ),
    renderList("Entities that almost always matter", playbook.keyEntities),
    renderList("Known project-killers to avoid", playbook.pitfalls),
    renderList("Industry-specific security notes", playbook.security),
    renderList("Success metrics that matter here", playbook.successMetrics),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function renderPattern(pattern: AppPattern): string {
  return [
    `PATTERN: ${pattern.name.toUpperCase()} (proven shape for this kind of request)`,
    renderList("Essential features", pattern.essentialFeatures),
    renderList("Usually recommended next", pattern.recommendedFeatures),
    renderList("Data model skeleton", pattern.dataModels),
    renderList("Typical roles", pattern.roles),
    renderList("Key workflows", pattern.workflows),
    renderList("Pitfalls that sink this kind of system", pattern.pitfalls),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Expertise block for the discovery interview prompt. */
export function buildInterviewKnowledge(context: {
  industry: string | null | undefined;
  requestText: string;
}): string {
  const { playbook, patterns } = selectKnowledge(context);
  const sections = [
    renderPlaybookForInterview(playbook),
    ...patterns.map(
      (pattern) =>
        `LIKELY SYSTEM TYPE: ${pattern.name}\n${renderList(
          "Make sure the interview covers",
          [
            ...pattern.essentialFeatures.slice(0, 3),
            ...pattern.pitfalls
              .slice(0, 2)
              .map((pitfall) => `Pitfall to probe: ${pitfall}`),
          ],
        )}`,
    ),
    INTERVIEW_CRAFT,
  ];
  return sections.filter(Boolean).join("\n\n---\n\n");
}

/** Expertise block for the blueprint generation prompt. */
export function buildBlueprintKnowledge(context: {
  industry: string | null | undefined;
  requestText: string;
}): string {
  const { playbook, patterns } = selectKnowledge(context);
  const sections = [
    renderPlaybookForBlueprint(playbook),
    ...patterns.map(renderPattern),
    DATA_MODELING_GUIDE,
  ];
  return sections.filter(Boolean).join("\n\n---\n\n");
}

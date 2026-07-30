/**
 * Forge's expertise library.
 *
 * Curated domain knowledge that gets selectively injected into AI prompts:
 * industry playbooks, application-type patterns, data-modeling guidance,
 * and interview craft. The selector in select.ts picks only what is
 * relevant to the current business and request, keeping prompts sharp
 * instead of drowning the model in everything at once.
 */

export interface IndustryPlaybook {
  /** Must match an entry in INDUSTRIES (or "Other"). */
  industry: string;
  /** Lowercase keywords that also signal this industry in free text. */
  aliases: string[];
  /** Who typically uses software in this business. */
  commonUsers: string[];
  /** Systems these businesses most often need. */
  typicalSystems: string[];
  /** Entities that almost always matter, with the fields that matter. */
  keyEntities: string[];
  /** High-value questions an expert consultant would ask early. */
  mustAskQuestions: string[];
  /** Mistakes that sink software projects in this industry. */
  pitfalls: string[];
  /** Security and compliance notes specific to this industry. */
  security: string[];
  /** What "this was worth it" tends to mean here. */
  successMetrics: string[];
}

export interface AppPattern {
  id: string;
  name: string;
  /** Lowercase keywords in the prompt/transcript that signal this pattern. */
  keywords: string[];
  essentialFeatures: string[];
  recommendedFeatures: string[];
  dataModels: string[];
  roles: string[];
  workflows: string[];
  pitfalls: string[];
}

import { z } from "zod";

/**
 * The validated blueprint structure — the contract between the AI layer and
 * the blueprint workspace. Deliberately lenient on string lengths but strict
 * on shape, with defaults so partial AI output degrades gracefully.
 */

const nonEmpty = z.string().trim().min(1);

export const blueprintUserSchema = z.object({
  name: nonEmpty,
  description: nonEmpty,
  goals: z.array(nonEmpty).default([]),
});

export const blueprintRoleSchema = z.object({
  name: nonEmpty,
  permissions: z.array(nonEmpty).default([]),
});

export const blueprintFeatureSchema = z.object({
  name: nonEmpty,
  description: nonEmpty,
  priority: z.enum(["essential", "recommended", "optional"]),
  acceptanceCriteria: z.array(nonEmpty).default([]),
});

export const blueprintPageSchema = z.object({
  name: nonEmpty,
  route: nonEmpty,
  purpose: nonEmpty,
  allowedRoles: z.array(nonEmpty).default([]),
  components: z.array(nonEmpty).default([]),
});

export const blueprintDataModelSchema = z.object({
  name: nonEmpty,
  description: nonEmpty,
  fields: z
    .array(
      z.object({
        name: nonEmpty,
        type: nonEmpty,
        required: z.boolean().default(false),
        description: z.string().default(""),
      }),
    )
    .default([]),
  relationships: z.array(nonEmpty).default([]),
});

export const blueprintWorkflowSchema = z.object({
  name: nonEmpty,
  trigger: nonEmpty,
  steps: z.array(nonEmpty).default([]),
  result: nonEmpty,
});

export const blueprintIntegrationSchema = z.object({
  name: nonEmpty,
  purpose: nonEmpty,
  required: z.boolean().default(false),
});

export const blueprintAiFeatureSchema = z.object({
  name: nonEmpty,
  purpose: nonEmpty,
  safeguards: z.array(nonEmpty).default([]),
});

export const projectBlueprintSchema = z.object({
  projectName: nonEmpty.max(120),
  oneSentenceSummary: nonEmpty.max(500),
  businessContext: z.object({
    industry: nonEmpty,
    businessDescription: nonEmpty,
    currentProblem: nonEmpty,
    desiredOutcome: nonEmpty,
  }),
  users: z.array(blueprintUserSchema).default([]),
  roles: z.array(blueprintRoleSchema).default([]),
  coreFeatures: z.array(blueprintFeatureSchema).default([]),
  pages: z.array(blueprintPageSchema).default([]),
  dataModels: z.array(blueprintDataModelSchema).default([]),
  workflows: z.array(blueprintWorkflowSchema).default([]),
  integrations: z.array(blueprintIntegrationSchema).default([]),
  aiFeatures: z.array(blueprintAiFeatureSchema).default([]),
  securityRequirements: z.array(nonEmpty).default([]),
  assumptions: z.array(nonEmpty).default([]),
  openQuestions: z.array(nonEmpty).default([]),
  mvpScope: z.array(nonEmpty).default([]),
  futureRoadmap: z.array(nonEmpty).default([]),
});

export type ProjectBlueprint = z.infer<typeof projectBlueprintSchema>;

/** Section keys used by the workspace navigation and section editing. */
export const BLUEPRINT_SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles" },
  { key: "coreFeatures", label: "Features" },
  { key: "pages", label: "Pages" },
  { key: "dataModels", label: "Data" },
  { key: "workflows", label: "Workflows" },
  { key: "integrations", label: "Integrations" },
  { key: "aiFeatures", label: "AI features" },
  { key: "securityRequirements", label: "Security" },
  { key: "mvpScope", label: "MVP scope" },
  { key: "futureRoadmap", label: "Roadmap" },
  { key: "openQuestions", label: "Open questions" },
] as const;

export type BlueprintSectionKey = (typeof BLUEPRINT_SECTIONS)[number]["key"];

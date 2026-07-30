import { z } from "zod";

import {
  projectBlueprintSchema,
  type BlueprintSectionKey,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";

/** The "overview" section groups the blueprint's top-level narrative fields. */
export const overviewSectionSchema = projectBlueprintSchema.pick({
  projectName: true,
  oneSentenceSummary: true,
  businessContext: true,
});

/** Returns the schema used to validate a manual edit of one section. */
export function getSectionSchema(key: BlueprintSectionKey): z.ZodTypeAny {
  if (key === "overview") return overviewSectionSchema;
  return projectBlueprintSchema.shape[key];
}

/** Extracts one section's editable value from a blueprint. */
export function getSectionValue(
  blueprint: ProjectBlueprint,
  key: BlueprintSectionKey,
): unknown {
  if (key === "overview") {
    return {
      projectName: blueprint.projectName,
      oneSentenceSummary: blueprint.oneSentenceSummary,
      businessContext: blueprint.businessContext,
    };
  }
  return blueprint[key];
}

/** Merges an edited section back into the blueprint, returning a new object. */
export function applySectionValue(
  blueprint: ProjectBlueprint,
  key: BlueprintSectionKey,
  value: unknown,
): ProjectBlueprint {
  if (key === "overview") {
    const overview = value as z.infer<typeof overviewSectionSchema>;
    return { ...blueprint, ...overview };
  }
  return { ...blueprint, [key]: value };
}

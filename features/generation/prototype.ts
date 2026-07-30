import type { ProjectBlueprint } from "@/features/blueprints/schema";

/**
 * Pure logic for the interactive prototype: derives screens, visible pages,
 * component block types, and sample data from a validated blueprint.
 * Deterministic and AI-free, so the prototype works with no configuration.
 */

export type BlockKind =
  "form" | "table" | "calendar" | "stats" | "actions" | "generic";

export interface PrototypePage {
  name: string;
  route: string;
  purpose: string;
  allowedRoles: string[];
  components: string[];
}

/** Pages the selected role can see. Pages without role limits are public. */
export function visiblePages(
  blueprint: ProjectBlueprint,
  role: string | null,
): PrototypePage[] {
  return blueprint.pages.filter((page) => {
    if (page.allowedRoles.length === 0 || role === null) return true;
    return page.allowedRoles.some(
      (allowed) => allowed.trim().toLowerCase() === role.trim().toLowerCase(),
    );
  });
}

/** Classifies a blueprint component description into a renderable block. */
export function classifyComponent(component: string): BlockKind {
  const text = component.toLowerCase();
  if (/(calendar|schedule view|availability)/.test(text)) return "calendar";
  if (
    /(form|create|add |edit |input|booking widget|signup|sign-up|upload)/.test(
      text,
    )
  ) {
    return "form";
  }
  if (/(table|list|grid|history|queue|feed|log|records)/.test(text)) {
    return "table";
  }
  if (
    /(chart|graph|stat|metric|report|analytics|kpi|summary|overview cards)/.test(
      text,
    )
  ) {
    return "stats";
  }
  if (/(button|action|toolbar|export)/.test(text)) return "actions";
  return "generic";
}

/**
 * Finds the data model most related to a page by counting shared words
 * between the model name and the page's name and components.
 */
export function matchDataModel(
  blueprint: ProjectBlueprint,
  page: PrototypePage,
): ProjectBlueprint["dataModels"][number] | null {
  if (blueprint.dataModels.length === 0) return null;

  const haystack = `${page.name} ${page.purpose} ${page.components.join(" ")}`
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 2);

  let best = blueprint.dataModels[0];
  let bestScore = -1;

  for (const model of blueprint.dataModels) {
    const words = model.name
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((word) => word.length > 2);
    let score = 0;
    for (const word of words) {
      // Singular/plural tolerant containment match.
      if (
        haystack.some(
          (candidate) =>
            candidate.startsWith(word.replace(/s$/, "")) ||
            word.startsWith(candidate.replace(/s$/, "")),
        )
      ) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = model;
      bestScore = score;
    }
  }
  return best;
}

/** A plausible, clearly-sample value for a field, by declared type. */
export function sampleValueForField(field: {
  name: string;
  type: string;
}): string {
  const type = field.type.toLowerCase();
  const name = field.name.toLowerCase();

  if (type.includes("bool")) return "Yes";
  if (type.includes("date") && type.includes("time")) return "Aug 12, 9:30 AM";
  if (type.includes("date")) return "Aug 12, 2026";
  if (type.includes("time")) return "9:30 AM";
  if (type.includes("email") || name.includes("email")) {
    return "sample@example.com";
  }
  if (type.includes("phone") || name.includes("phone")) return "(555) 010-0199";
  if (
    type.includes("number") ||
    type.includes("int") ||
    type.includes("decimal")
  ) {
    if (
      name.includes("price") ||
      name.includes("cost") ||
      name.includes("amount")
    ) {
      return "$120.00";
    }
    return "42";
  }
  if (type.includes("enum") || name.includes("status")) return "Active";
  if (type.includes("reference") || type.includes("relation"))
    return "Linked record";
  if (name.includes("name")) return "Sample name";
  return "Sample text";
}

/** The input type used when rendering a form control for a field. */
export function inputTypeForField(field: {
  name: string;
  type: string;
}): "text" | "email" | "tel" | "number" | "date" | "checkbox" | "select" {
  const type = field.type.toLowerCase();
  const name = field.name.toLowerCase();
  if (type.includes("bool")) return "checkbox";
  if (type.includes("enum") || name.includes("status")) return "select";
  if (type.includes("date")) return "date";
  if (type.includes("email") || name.includes("email")) return "email";
  if (type.includes("phone") || name.includes("phone")) return "tel";
  if (
    type.includes("number") ||
    type.includes("int") ||
    type.includes("decimal")
  ) {
    return "number";
  }
  return "text";
}

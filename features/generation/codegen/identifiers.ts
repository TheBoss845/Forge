/** Naming helpers for generated code. */

export function words(text: string): string[] {
  return text
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function pascalCase(text: string): string {
  const parts = words(text);
  if (parts.length === 0) return "Item";
  return parts
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function camelCase(text: string): string {
  const pascal = pascalCase(text);
  return pascal[0].toLowerCase() + pascal.slice(1);
}

export function snakeCase(text: string): string {
  const parts = words(text);
  if (parts.length === 0) return "item";
  return parts.map((part) => part.toLowerCase()).join("_");
}

export function kebabCase(text: string): string {
  const parts = words(text);
  if (parts.length === 0) return "item";
  return parts.map((part) => part.toLowerCase()).join("-");
}

/**
 * Converts a blueprint route like "/book" or "/admin/reports" into safe
 * path segments for app-router folders. Returns [] for the home route.
 */
export function routeSegments(route: string): string[] {
  return route
    .split("/")
    .map((segment) => kebabCase(segment))
    .filter((segment) => segment.length > 0 && segment !== "item");
}

import type { ProjectBlueprint } from "@/features/blueprints/schema";
import {
  blocksTsx,
  homePageTsx,
  layoutTsx,
  normalizedRoute,
  pageTsx,
  sampleDataTs,
  typesTs,
} from "@/features/generation/codegen/app-files";
import {
  envExample,
  gitignore,
  globalsCss,
  nextConfig,
  packageJson,
  readme,
  tsconfigJson,
} from "@/features/generation/codegen/base-files";
import { routeSegments } from "@/features/generation/codegen/identifiers";
import { generateSchemaSql } from "@/features/generation/codegen/sql";

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

/**
 * Template-based application generation: converts a validated blueprint into
 * a complete, runnable Next.js starter project. Deterministic — no AI calls.
 */
export function generateApplicationFiles(
  blueprint: ProjectBlueprint,
): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: "package.json", content: packageJson(blueprint), language: "json" },
    { path: "tsconfig.json", content: tsconfigJson(), language: "json" },
    { path: "next.config.ts", content: nextConfig(), language: "typescript" },
    { path: ".gitignore", content: gitignore(), language: "text" },
    { path: ".env.example", content: envExample(blueprint), language: "text" },
    { path: "README.md", content: readme(blueprint), language: "markdown" },
    { path: "app/globals.css", content: globalsCss(), language: "css" },
    {
      path: "app/layout.tsx",
      content: layoutTsx(blueprint),
      language: "typescript",
    },
    {
      path: "app/page.tsx",
      content: homePageTsx(blueprint),
      language: "typescript",
    },
    {
      path: "components/blocks.tsx",
      content: blocksTsx(),
      language: "typescript",
    },
  ];

  if (blueprint.dataModels.length > 0) {
    files.push(
      {
        path: "lib/types.ts",
        content: typesTs(blueprint),
        language: "typescript",
      },
      {
        path: "lib/sample-data.ts",
        content: sampleDataTs(blueprint),
        language: "typescript",
      },
      {
        path: "supabase/schema.sql",
        content: generateSchemaSql(blueprint),
        language: "sql",
      },
    );
  }

  // One page per blueprint page; routes collapsing to "/" are covered by the
  // generated home page, and duplicate routes keep the first occurrence.
  const seenRoutes = new Set<string>(["/"]);
  for (const page of blueprint.pages) {
    const route = normalizedRoute(page.route);
    if (seenRoutes.has(route)) continue;
    seenRoutes.add(route);
    files.push({
      path: `app/${routeSegments(page.route).join("/")}/page.tsx`,
      content: pageTsx(blueprint, page),
      language: "typescript",
    });
  }

  return files;
}

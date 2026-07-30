import type { ProjectBlueprint } from "@/features/blueprints/schema";

/**
 * Client helper: requests the generated starter ZIP for a blueprint and
 * triggers a browser download. Returns an error message, or null on success.
 */
export async function downloadBlueprintZip(
  blueprint: ProjectBlueprint,
): Promise<string | null> {
  try {
    const response = await fetch("/api/guest/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blueprint }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      return data?.error ?? "Download failed. Please try again.";
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${blueprint.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
    return null;
  } catch {
    return "Download failed. Check your connection and try again.";
  }
}

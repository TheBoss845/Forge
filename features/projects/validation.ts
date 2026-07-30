import { z } from "zod";

export const newProjectSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(
      20,
      "Describe what you need in a bit more detail — at least a sentence.",
    )
    .max(4000, "Keep the description under 4000 characters."),
});

export type NewProjectInput = z.infer<typeof newProjectSchema>;

/** Derives a short, readable working name from the initial prompt. */
export function deriveProjectName(prompt: string): string {
  const words = prompt.trim().replace(/\s+/g, " ").split(" ").slice(0, 8);
  const name = words.join(" ");
  return name.length > 60 ? `${name.slice(0, 57)}…` : name;
}

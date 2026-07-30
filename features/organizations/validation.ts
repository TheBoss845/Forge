import { z } from "zod";

export const INDUSTRIES = [
  "Medical & dental",
  "Repair & maintenance",
  "Construction",
  "Restaurants & food",
  "Property management",
  "Retail",
  "Manufacturing",
  "Education",
  "Nonprofit",
  "Consulting",
  "Fitness & wellness",
  "Veterinary",
  "Legal",
  "Accounting & finance",
  "Real estate",
  "Other",
] as const;

export const TEAM_SIZES = [
  "Just me",
  "2–5 people",
  "6–20 people",
  "21–50 people",
  "51–200 people",
  "More than 200",
] as const;

export const onboardingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Enter your business name.")
    .max(120, "Business name is too long."),
  industry: z.enum(INDUSTRIES, { message: "Choose your industry." }),
  description: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least a sentence.")
    .max(2000, "Keep the description under 2000 characters."),
  teamSize: z.enum(TEAM_SIZES, { message: "Choose your team size." }),
  location: z.string().trim().max(200, "Location is too long.").optional(),
  mainCustomerType: z
    .string()
    .trim()
    .min(2, "Describe your main customer type.")
    .max(300, "Keep this under 300 characters."),
  currentTools: z
    .string()
    .trim()
    .max(500, "Keep this under 500 characters.")
    .optional(),
  biggestProblem: z
    .string()
    .trim()
    .min(10, "Describe the problem in a sentence or two.")
    .max(2000, "Keep this under 2000 characters."),
  desiredOutcome: z
    .string()
    .trim()
    .min(5, "Describe what success would look like.")
    .max(2000, "Keep this under 2000 characters."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Field groups for the multi-step wizard, validated one step at a time. */
export const ONBOARDING_STEPS = [
  {
    title: "Your business",
    description: "The basics, so Forge knows who it is building for.",
    fields: ["businessName", "industry", "teamSize"],
  },
  {
    title: "What you do",
    description: "A short description and where you operate.",
    fields: ["description", "location", "mainCustomerType"],
  },
  {
    title: "The problem",
    description: "What slows you down today, and what success looks like.",
    fields: ["currentTools", "biggestProblem", "desiredOutcome"],
  },
] as const satisfies ReadonlyArray<{
  title: string;
  description: string;
  fields: ReadonlyArray<keyof OnboardingInput>;
}>;

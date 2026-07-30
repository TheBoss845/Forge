import { z } from "zod";

export const interviewSummarySchema = z.object({
  knownFacts: z.array(z.string().min(1)).max(40).default([]),
  openTopics: z.array(z.string().min(1)).max(20).default([]),
  progressPercent: z.number().min(0).max(100).default(0),
});

export const interviewTurnSchema = z.object({
  message: z
    .string()
    .min(1, "The assistant message must not be empty.")
    .max(4000),
  whyThisMatters: z.string().max(500).optional(),
  suggestedAnswers: z.array(z.string().min(1).max(300)).max(4).default([]),
  discoveryComplete: z.boolean().default(false),
  updatedSummary: interviewSummarySchema,
});

export type InterviewTurn = z.infer<typeof interviewTurnSchema>;
export type InterviewSummaryData = z.infer<typeof interviewSummarySchema>;

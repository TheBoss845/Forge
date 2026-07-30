import { z } from "zod";

import { interviewSummarySchema } from "@/features/interviews/schema";
import type { OrganizationRow, ProjectRow } from "@/types/database";

/**
 * Guest mode: the full AI experience without an account or database.
 * State lives in the visitor's browser; these schemas validate what the
 * browser sends to the guest API routes.
 */

export const guestBusinessSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10).max(2000),
  biggestProblem: z.string().trim().min(5).max(2000),
});

export const guestTranscriptSchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    }),
  )
  .max(60);

export const guestInterviewRequestSchema = z.object({
  business: guestBusinessSchema,
  prompt: z.string().trim().min(20).max(4000),
  transcript: guestTranscriptSchema,
  summary: interviewSummarySchema.nullable(),
});

export const guestBlueprintRequestSchema = z.object({
  business: guestBusinessSchema,
  prompt: z.string().trim().min(20).max(4000),
  transcript: guestTranscriptSchema,
});

export type GuestBusiness = z.infer<typeof guestBusinessSchema>;

/** Adapts guest form data to the shape the interview/blueprint agents use. */
export function toSyntheticContext(
  business: GuestBusiness,
  prompt: string,
): { organization: OrganizationRow; project: ProjectRow } {
  const now = new Date().toISOString();
  return {
    organization: {
      id: "guest",
      name: business.businessName,
      slug: "guest",
      description: business.description,
      industry: business.industry,
      team_size: null,
      location: null,
      main_customer_type: null,
      current_tools: null,
      biggest_problem: business.biggestProblem,
      desired_outcome: null,
      created_by: "guest",
      created_at: now,
      updated_at: now,
    },
    project: {
      id: "guest",
      organization_id: "guest",
      name: business.businessName,
      slug: "guest",
      description: null,
      status: "discovery",
      industry: business.industry,
      original_prompt: prompt,
      active_blueprint_version_id: null,
      created_by: "guest",
      created_at: now,
      updated_at: now,
    },
  };
}

/** Best-effort client IP for rate limiting guest requests. */
export function requestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export const GUEST_RATE_LIMIT = { limit: 15, windowMs: 10 * 60 * 1000 };

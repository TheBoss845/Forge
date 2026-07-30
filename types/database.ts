/**
 * Hand-maintained database types matching supabase/migrations.
 * Update this file whenever a migration changes the schema.
 */

export type OrganizationRole = "owner" | "admin" | "member" | "viewer";

export type ProjectStatus =
  | "discovery"
  | "blueprint"
  | "approved"
  | "generating"
  | "ready"
  | "deployed"
  | "archived";

export type InterviewStatus = "active" | "completed" | "abandoned";

export type BlueprintStatus = "draft" | "approved" | "superseded";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  team_size: string | null;
  location: string | null;
  main_customer_type: string | null;
  current_tools: string | null;
  biggest_problem: string | null;
  desired_outcome: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
}

export interface ProjectRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  industry: string | null;
  original_prompt: string;
  active_blueprint_version_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewSessionRow {
  id: string;
  project_id: string;
  status: InterviewStatus;
  current_stage: string | null;
  summary: InterviewSummary | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewMessageRow {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  structured_data: InterviewAssistantData | null;
  created_at: string;
}

export interface BlueprintRow {
  id: string;
  project_id: string;
  version_number: number;
  title: string;
  summary: string | null;
  content: unknown;
  status: BlueprintStatus;
  created_by: string;
  created_at: string;
}

export interface AiUsageRow {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  user_id: string | null;
  operation: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number | null;
  created_at: string;
}

/** Structured understanding accumulated during the discovery interview. */
export interface InterviewSummary {
  knownFacts: string[];
  openTopics: string[];
  progressPercent: number;
}

/** Structured data attached to each assistant interview message. */
export interface InterviewAssistantData {
  whyThisMatters?: string;
  suggestedAnswers?: string[];
  discoveryComplete?: boolean;
  updatedSummary?: InterviewSummary;
}

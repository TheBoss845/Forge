import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  InterviewPanel,
  type DisplayMessage,
} from "@/components/interview/interview-panel";
import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { interviewSummarySchema } from "@/features/interviews/schema";
import { getProject } from "@/features/projects/queries";
import { isAiConfigured } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/database/server";
import type {
  InterviewMessageRow,
  InterviewSessionRow,
} from "@/types/database";

export const metadata: Metadata = { title: "Discovery interview" };

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const project = await getProject(supabase, projectId);
  if (!project) notFound();

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const typedSession = session as InterviewSessionRow | null;

  let messages: DisplayMessage[] = [];
  if (typedSession) {
    const { data: rows } = await supabase
      .from("interview_messages")
      .select("*")
      .eq("session_id", typedSession.id)
      .order("created_at", { ascending: true })
      .limit(200);

    messages = ((rows ?? []) as InterviewMessageRow[]).map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      whyThisMatters: row.structured_data?.whyThisMatters,
      suggestedAnswers: row.structured_data?.suggestedAnswers,
    }));
  }

  const summaryParse = interviewSummarySchema.safeParse(typedSession?.summary);

  return (
    <div className="mx-auto max-w-6xl">
      <ProjectPageHeader
        project={project}
        subtitle="Forge is learning about your business before it plans anything."
      />
      <ProjectTabs projectId={project.id} />
      <InterviewPanel
        projectId={project.id}
        initialMessages={messages}
        initialSummary={summaryParse.success ? summaryParse.data : null}
        aiConfigured={isAiConfigured()}
      />
    </div>
  );
}

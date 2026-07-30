"use server";

import { redirect } from "next/navigation";

import { onboardingSchema } from "@/features/organizations/validation";
import { trackEvent } from "@/lib/analytics/events";
import { createSupabaseServerClient } from "@/lib/database/server";
import { slugify } from "@/lib/utilities/slug";

export interface OnboardingActionResult {
  error?: string;
}

export async function completeOnboardingAction(
  input: unknown,
): Promise<OnboardingActionResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Forge is not connected to a database yet." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  const values = parsed.data;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: values.businessName,
      slug: slugify(values.businessName),
      description: values.description,
      industry: values.industry,
      team_size: values.teamSize,
      location: values.location || null,
      main_customer_type: values.mainCustomerType,
      current_tools: values.currentTools || null,
      biggest_problem: values.biggestProblem,
      desired_outcome: values.desiredOutcome,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orgError || !organization) {
    console.error("onboarding: organization insert failed", orgError?.code);
    return {
      error:
        "Could not save your business profile. Your answers are still in this form — please try again.",
    };
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    console.error("onboarding: membership insert failed", memberError.code);
    return { error: "Could not finish setup. Please try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (profileError) {
    console.error("onboarding: profile update failed", profileError.code);
  }

  trackEvent("onboarding_completed");
  redirect("/dashboard");
}

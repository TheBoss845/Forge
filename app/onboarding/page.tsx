import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import {
  getPrimaryOrganization,
  getProfile,
} from "@/features/organizations/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

export const metadata: Metadata = { title: "Set up your business" };

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const [profile, organization] = await Promise.all([
    getProfile(supabase, user.id),
    getPrimaryOrganization(supabase, user.id),
  ]);

  if (profile?.onboarding_completed && organization) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <Link href="/" aria-label="Forge home" className="mb-8 rounded-md">
        <Logo />
      </Link>
      <div className="w-full max-w-xl rounded-lg border border-border-subtle bg-surface p-8 shadow-card">
        <OnboardingWizard />
      </div>
      <p className="mt-6 max-w-xl text-center text-caption text-muted">
        Forge uses these answers to understand your business before it plans any
        software. You can change everything later.
      </p>
    </div>
  );
}

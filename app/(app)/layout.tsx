import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  getPrimaryOrganization,
  getProfile,
} from "@/features/organizations/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, organization] = await Promise.all([
    getProfile(supabase, user.id),
    getPrimaryOrganization(supabase, user.id),
  ]);

  if (!profile?.onboarding_completed || !organization) {
    redirect("/onboarding");
  }

  return <AppShell organizationName={organization.name}>{children}</AppShell>;
}

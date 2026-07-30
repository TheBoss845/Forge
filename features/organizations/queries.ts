import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrganizationRow, ProfileRow } from "@/types/database";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as ProfileRow | null;
}

/** The user's primary organization (first joined). Null before onboarding. */
export async function getPrimaryOrganization(
  supabase: SupabaseClient,
  userId: string,
): Promise<OrganizationRow | null> {
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  return organization as OrganizationRow | null;
}

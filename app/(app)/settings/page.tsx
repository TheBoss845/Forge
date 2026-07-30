import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/settings/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProfile } from "@/features/organizations/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-page-title text-primary">Settings</h1>
      <p className="mt-1 text-body-sm text-secondary">Manage your account.</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            How you appear across your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultFullName={profile?.full_name ?? ""}
            email={user.email ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}

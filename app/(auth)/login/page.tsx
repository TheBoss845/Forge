import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LocalModeCard } from "@/components/auth/local-mode-card";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/database/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  if (!configured) {
    return <LocalModeCard />;
  }

  return (
    <AuthFormShell
      title="Welcome back"
      description="Sign in to continue building with Forge."
      configured={configured}
    >
      {params.reset === "success" ? (
        <Alert variant="success" className="mb-4">
          Password updated. Sign in with your new password.
        </Alert>
      ) : null}
      {params.error === "link_invalid" ? (
        <Alert variant="danger" className="mb-4">
          That link is invalid or has expired. Sign in, or request a new link.
        </Alert>
      ) : null}
      <LoginForm configured={configured} next={params.next} />
    </AuthFormShell>
  );
}

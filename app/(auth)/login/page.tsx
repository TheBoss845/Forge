import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LocalLoginForm } from "@/components/auth/local-auth-forms";
import { LocalModeCard } from "@/components/auth/local-mode-card";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/alert";
import { getAccountsMode } from "@/lib/utilities/capabilities";

export const metadata: Metadata = { title: "Sign in" };

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const mode = getAccountsMode();

  if (mode === "none") {
    return <LocalModeCard />;
  }

  if (mode === "local") {
    return (
      <AuthFormShell
        title="Welcome back"
        description="Sign in to reach your projects from any device."
        configured
      >
        <LocalLoginForm />
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Welcome back"
      description="Sign in to continue building with Forge."
      configured
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
      <LoginForm configured next={params.next} />
    </AuthFormShell>
  );
}

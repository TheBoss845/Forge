import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LocalRegisterForm } from "@/components/auth/local-auth-forms";
import { LocalModeCard } from "@/components/auth/local-mode-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getAccountsMode } from "@/lib/utilities/capabilities";

export const metadata: Metadata = { title: "Create account" };

// Evaluate configuration per request, not at build time.
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const mode = getAccountsMode();

  if (mode === "none") {
    return <LocalModeCard />;
  }

  if (mode === "local") {
    return (
      <AuthFormShell
        title="Create your account"
        description="Your projects will follow you to any device you sign in on."
        configured
      >
        <LocalRegisterForm />
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Create your account"
      description="Start with a conversation. Leave with a software plan."
      configured
    >
      <RegisterForm configured />
    </AuthFormShell>
  );
}

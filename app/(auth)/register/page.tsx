import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LocalModeCard } from "@/components/auth/local-mode-card";
import { RegisterForm } from "@/components/auth/register-form";
import { isSupabaseConfigured } from "@/lib/database/env";

export const metadata: Metadata = { title: "Create account" };

// Evaluate configuration per request, not at build time.
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return <LocalModeCard />;
  }

  return (
    <AuthFormShell
      title="Create your account"
      description="Start with a conversation. Leave with a software plan."
      configured={configured}
    >
      <RegisterForm configured={configured} />
    </AuthFormShell>
  );
}

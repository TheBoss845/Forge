import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LocalModeCard } from "@/components/auth/local-mode-card";
import { isSupabaseConfigured } from "@/lib/database/env";

export const metadata: Metadata = { title: "Reset password" };

// Evaluate configuration per request, not at build time.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return <LocalModeCard />;
  }

  return (
    <AuthFormShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      configured={configured}
    >
      <ForgotPasswordForm configured={configured} />
    </AuthFormShell>
  );
}

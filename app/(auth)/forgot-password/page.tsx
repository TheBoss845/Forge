import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isSupabaseConfigured } from "@/lib/database/env";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();

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

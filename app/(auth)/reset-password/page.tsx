import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isSupabaseConfigured } from "@/lib/database/env";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  const configured = isSupabaseConfigured();

  return (
    <AuthFormShell
      title="Choose a new password"
      description="You followed a reset link — set your new password below."
      configured={configured}
    >
      <ResetPasswordForm configured={configured} />
    </AuthFormShell>
  );
}

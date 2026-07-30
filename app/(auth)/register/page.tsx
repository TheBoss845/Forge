import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { isSupabaseConfigured } from "@/lib/database/env";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  const configured = isSupabaseConfigured();

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

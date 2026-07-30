import type { Metadata } from "next";

import Link from "next/link";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LocalModeCard } from "@/components/auth/local-mode-card";
import { Alert } from "@/components/ui/alert";
import { getAccountsMode } from "@/lib/utilities/capabilities";

export const metadata: Metadata = { title: "Reset password" };

// Evaluate configuration per request, not at build time.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const mode = getAccountsMode();

  if (mode === "none") {
    return <LocalModeCard />;
  }

  if (mode === "local") {
    return (
      <AuthFormShell
        title="Password reset"
        description="Not available on this deployment yet."
        configured
      >
        <Alert variant="info">
          <p>
            This deployment uses Forge&apos;s built-in accounts, which cannot
            send password-reset emails yet. If you are locked out, contact the
            site owner — or start fresh with a new account.
          </p>
        </Alert>
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-body-sm text-accent hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      configured
    >
      <ForgotPasswordForm configured />
    </AuthFormShell>
  );
}

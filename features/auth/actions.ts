"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/validation";
import { trackEvent } from "@/lib/analytics/events";
import { createSupabaseServerClient } from "@/lib/database/server";
import { getAppUrl } from "@/lib/utilities/app-url";

export interface AuthActionResult {
  error?: string;
  /** Informational success message (e.g. "check your email"). */
  message?: string;
}

const NOT_CONFIGURED: AuthActionResult = {
  error:
    "Authentication is not configured yet. The site owner needs to add Supabase credentials.",
};

/** Only allow same-site relative paths as post-auth redirect targets. */
function safeNextPath(next: unknown): string {
  return typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//")
    ? next
    : "/dashboard";
}

export async function signInAction(
  input: unknown,
  next?: string,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect(safeNextPath(next));
}

export async function signUpAction(input: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getAppUrl()}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) {
    return {
      error:
        error.code === "user_already_exists"
          ? "An account with this email already exists. Try signing in."
          : "Registration failed. Please try again.",
    };
  }

  trackEvent("account_created");

  // When email confirmation is enabled, no session is returned yet.
  if (!data.session) {
    return {
      message:
        "Check your email — we sent a confirmation link to finish creating your account.",
    };
  }

  redirect("/onboarding");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPasswordResetAction(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/confirm?next=/reset-password`,
  });

  // Same response whether or not the account exists, to avoid leaking it.
  return {
    message:
      "If an account exists for that email, a password reset link is on its way.",
  };
}

export async function resetPasswordAction(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error:
        "Could not update the password. The reset link may have expired — request a new one.",
    };
  }

  redirect("/login?reset=success");
}

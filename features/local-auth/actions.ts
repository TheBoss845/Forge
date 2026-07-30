"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { loginSchema, registerSchema } from "@/features/auth/validation";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  authenticateLocalUser,
  createLocalUser,
  createSessionToken,
  verifySessionToken,
  type LocalUser,
} from "@/features/local-auth/service";
import { trackEvent } from "@/lib/analytics/events";
import { checkRateLimit } from "@/lib/security/rate-limit";

export interface LocalAuthResult {
  error?: string;
}

const AUTH_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

async function clientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function setSessionCookie(user: LocalUser): Promise<boolean> {
  const token = await createSessionToken(user);
  if (!token) return false;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
  return true;
}

export async function localSignUpAction(
  input: unknown,
): Promise<LocalAuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const rate = checkRateLimit(
    `local-auth:${await clientIp()}`,
    AUTH_RATE_LIMIT,
  );
  if (!rate.allowed) {
    return {
      error: `Too many attempts — please wait ${rate.retryAfterSeconds} seconds.`,
    };
  }

  const result = await createLocalUser(parsed.data);
  if (result.error || !result.user) {
    return { error: result.error ?? "Registration failed. Please try again." };
  }

  if (!(await setSessionCookie(result.user))) {
    return { error: "Could not start your session. Please try signing in." };
  }

  trackEvent("account_created");
  redirect("/try");
}

export async function localSignInAction(
  input: unknown,
): Promise<LocalAuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const rate = checkRateLimit(
    `local-auth:${await clientIp()}`,
    AUTH_RATE_LIMIT,
  );
  if (!rate.allowed) {
    return {
      error: `Too many attempts — please wait ${rate.retryAfterSeconds} seconds.`,
    };
  }

  const user = await authenticateLocalUser(
    parsed.data.email,
    parsed.data.password,
  );
  if (!user) {
    return { error: "Incorrect email or password." };
  }

  if (!(await setSessionCookie(user))) {
    return { error: "Could not start your session. Please try again." };
  }

  redirect("/try");
}

export async function localSignOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

/** The signed-in local user for the current request, or null. */
export async function getLocalSessionUser(): Promise<LocalUser | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

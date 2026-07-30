import "server-only";

import {
  createHmac,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { getKvStore } from "@/lib/storage/kv";

const scrypt = promisify(scryptCallback);

/**
 * Forge's built-in accounts: email + password stored in the platform's
 * key-value store (Netlify Blobs in production). Passwords are hashed with
 * scrypt; sessions are stateless HMAC-signed tokens in an HttpOnly cookie.
 *
 * Honest scope: no email verification or password reset (those need an
 * email service). Suitable for the free tier; Supabase auth replaces this
 * automatically when configured.
 */

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface StoredUser extends LocalUser {
  /** Format: scrypt$<salt-hex>$<hash-hex> */
  passwordHash: string;
}

export const SESSION_COOKIE = "forge_session";
export const SESSION_DAYS = 30;

const userKey = (email: string) => `user:${email.toLowerCase()}`;
const workspaceKey = (userId: string) => `workspace:${userId}`;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hashHex) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

async function getSessionSecret(): Promise<string | null> {
  const store = getKvStore();
  if (!store) return null;
  const existing = await store.get("config:session-secret");
  if (existing) return existing;
  const secret = randomBytes(32).toString("hex");
  await store.set("config:session-secret", secret);
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSessionToken(
  user: LocalUser,
): Promise<string | null> {
  const secret = await getSessionSecret();
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({
      uid: user.id,
      email: user.email,
      name: user.fullName,
      exp: Date.now() + SESSION_DAYS * 24 * 3600 * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<LocalUser | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const secret = await getSessionSecret();
  if (!secret) return null;

  const expected = sign(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      uid: string;
      email: string;
      name: string;
      exp: number;
    };
    if (data.exp < Date.now()) return null;
    return {
      id: data.uid,
      email: data.email,
      fullName: data.name,
      createdAt: "",
    };
  } catch {
    return null;
  }
}

export async function createLocalUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ user?: LocalUser; error?: string }> {
  const store = getKvStore();
  if (!store) return { error: "Account storage is not available." };

  const key = userKey(input.email);
  if (await store.get(key)) {
    return {
      error: "An account with this email already exists. Try signing in.",
    };
  }

  const user: StoredUser = {
    id: randomUUID(),
    email: input.email.toLowerCase(),
    fullName: input.fullName,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(input.password),
  };
  await store.set(key, JSON.stringify(user));

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    },
  };
}

export async function authenticateLocalUser(
  email: string,
  password: string,
): Promise<LocalUser | null> {
  const store = getKvStore();
  if (!store) return null;

  const raw = await store.get(userKey(email));
  if (!raw) return null;

  try {
    const user = JSON.parse(raw) as StoredUser;
    if (!(await verifyPassword(password, user.passwordHash))) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}

export async function loadUserWorkspace(
  userId: string,
): Promise<string | null> {
  const store = getKvStore();
  if (!store) return null;
  return store.get(workspaceKey(userId));
}

export async function saveUserWorkspace(
  userId: string,
  workspaceJson: string,
): Promise<boolean> {
  const store = getKvStore();
  if (!store) return false;
  await store.set(workspaceKey(userId), workspaceJson);
  return true;
}

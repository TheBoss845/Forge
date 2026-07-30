import { NextResponse } from "next/server";

import { getLocalSessionUser } from "@/features/local-auth/actions";
import {
  loadUserWorkspace,
  saveUserWorkspace,
} from "@/features/local-auth/service";

/**
 * Account workspace sync for Forge's built-in accounts: the same project
 * store the browser keeps locally, saved server-side per user so projects
 * follow the account across devices.
 */

export async function GET() {
  const user = await getLocalSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  const raw = await loadUserWorkspace(user.id);
  let store: unknown = null;
  if (raw) {
    try {
      store = JSON.parse(raw);
    } catch {
      store = null;
    }
  }

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    fullName: user.fullName,
    store,
  });
}

export async function PUT(request: Request) {
  const user = await getLocalSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.text();
  if (body.length > 2_000_000) {
    return NextResponse.json(
      { error: "Workspace too large to sync." },
      { status: 413 },
    );
  }

  try {
    const parsed = JSON.parse(body) as { projects?: unknown };
    if (!Array.isArray(parsed.projects)) {
      return NextResponse.json(
        { error: "Invalid workspace." },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid workspace." }, { status: 400 });
  }

  const saved = await saveUserWorkspace(user.id, body);
  if (!saved) {
    return NextResponse.json(
      { error: "Storage unavailable." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}

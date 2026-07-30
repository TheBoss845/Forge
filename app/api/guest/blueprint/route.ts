import { NextResponse } from "next/server";

import { generateBlueprint } from "@/features/blueprints/service";
import {
  GUEST_RATE_LIMIT,
  guestBlueprintRequestSchema,
  requestIp,
  toSyntheticContext,
} from "@/features/guest/schema";
import { getAiProvider } from "@/lib/ai";
import { checkRateLimit } from "@/lib/security/rate-limit";

/** Guest blueprint generation: returns the blueprint, stores nothing. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = guestBlueprintRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rate = checkRateLimit(
    `guest-blueprint:${requestIp(request)}`,
    GUEST_RATE_LIMIT,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Please wait ${rate.retryAfterSeconds} seconds before generating again.`,
      },
      { status: 429 },
    );
  }

  const provider = getAiProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "The AI is not configured on this deployment yet. The site owner needs to add an AI API key.",
      },
      { status: 503 },
    );
  }

  const { organization, project } = toSyntheticContext(
    parsed.data.business,
    parsed.data.prompt,
  );

  try {
    const outcome = await generateBlueprint(provider, {
      organization,
      project,
      transcript: parsed.data.transcript,
    });
    return NextResponse.json({ blueprint: outcome.blueprint });
  } catch (error) {
    console.error(
      "guest blueprint: generation failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "Blueprint generation failed. Please try again in a moment." },
      { status: 502 },
    );
  }
}

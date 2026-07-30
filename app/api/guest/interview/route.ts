import { NextResponse } from "next/server";

import {
  GUEST_RATE_LIMIT,
  guestInterviewRequestSchema,
  requestIp,
  toSyntheticContext,
} from "@/features/guest/schema";
import { generateInterviewTurn } from "@/features/interviews/service";
import { getAiProvider } from "@/lib/ai";
import { checkRateLimit } from "@/lib/security/rate-limit";

/** Guest discovery interview: one turn per call, no data stored server-side. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = guestInterviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rate = checkRateLimit(
    `guest-interview:${requestIp(request)}`,
    GUEST_RATE_LIMIT,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `You're moving fast! Please wait ${rate.retryAfterSeconds} seconds and try again.`,
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
    const outcome = await generateInterviewTurn(provider, {
      organization,
      project,
      summary: parsed.data.summary,
      transcript: parsed.data.transcript,
    });
    return NextResponse.json({ turn: outcome.turn });
  } catch (error) {
    console.error(
      "guest interview: turn failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "The AI had trouble responding. Please try again in a moment." },
      { status: 502 },
    );
  }
}

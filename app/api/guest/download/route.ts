import JSZip from "jszip";
import { NextResponse } from "next/server";

import { projectBlueprintSchema } from "@/features/blueprints/schema";
import { generateApplicationFiles } from "@/features/generation/codegen";
import { kebabCase } from "@/features/generation/codegen/identifiers";
import { GUEST_RATE_LIMIT, requestIp } from "@/features/guest/schema";
import { checkRateLimit } from "@/lib/security/rate-limit";

/**
 * Guest code download: generates the starter app from a submitted blueprint
 * and streams it back as a ZIP. Deterministic — no AI, nothing stored.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = projectBlueprintSchema.safeParse(
    (body as { blueprint?: unknown })?.blueprint,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid blueprint." }, { status: 400 });
  }

  const rate = checkRateLimit(
    `guest-download:${requestIp(request)}`,
    GUEST_RATE_LIMIT,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many downloads — please wait a minute." },
      { status: 429 },
    );
  }

  const files = generateApplicationFiles(parsed.data);
  const zip = new JSZip();
  const root = kebabCase(parsed.data.projectName) || "forge-app";
  for (const file of files) {
    zip.file(`${root}/${file.path}`, file.content);
  }
  const archive = await zip.generateAsync({ type: "uint8array" });

  return new NextResponse(Buffer.from(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${root}.zip"`,
    },
  });
}

import JSZip from "jszip";
import { NextResponse } from "next/server";

import { listProjectFiles } from "@/features/generation/queries";
import { getProject } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/database/server";

/** Downloads the generated application as a ZIP. Access enforced by RLS. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProject(supabase, projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const files = await listProjectFiles(supabase, project.id);
  if (files.length === 0) {
    return NextResponse.json(
      { error: "No generated files yet" },
      { status: 404 },
    );
  }

  const zip = new JSZip();
  const root = project.slug || "forge-app";
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

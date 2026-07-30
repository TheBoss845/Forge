"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EXAMPLE_BLUEPRINT } from "@/features/blueprints/example";
import { downloadBlueprintZip } from "@/lib/utilities/download-blueprint";

/** Lets any visitor download the example project's generated starter code. */
export function DownloadExampleButton() {
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setError(null);
    setDownloading(true);
    setError(await downloadBlueprintZip(EXAMPLE_BLUEPRINT));
    setDownloading(false);
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <Button
        variant="secondary"
        size="lg"
        onClick={download}
        disabled={downloading}
      >
        <Download aria-hidden="true" />
        {downloading ? "Preparing ZIP…" : "Download this example's code"}
      </Button>
      {error ? (
        <p className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-caption text-muted">
          A real, runnable Next.js starter generated from this blueprint.
        </p>
      )}
    </div>
  );
}

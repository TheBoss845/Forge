"use client";

import { Download, RotateCcw } from "lucide-react";
import { useState } from "react";

import { PrototypePreview } from "@/components/builder/prototype-preview";
import { SectionContent } from "@/components/blueprint/section-content";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BLUEPRINT_SECTIONS,
  type BlueprintSectionKey,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import { cn } from "@/lib/utilities/cn";

export function GuestBlueprintView({
  blueprint,
  onRestart,
}: {
  blueprint: ProjectBlueprint;
  onRestart: () => void;
}) {
  const [activeSection, setActiveSection] =
    useState<BlueprintSectionKey>("overview");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const activeLabel =
    BLUEPRINT_SECTIONS.find((section) => section.key === activeSection)
      ?.label ?? "Section";

  const download = async () => {
    setError(null);
    setDownloading(true);
    try {
      const response = await fetch("/api/guest/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Download failed. Please try again.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${blueprint.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-section-title text-primary">
            {blueprint.projectName}
          </h2>
          <p className="mt-1 text-body-sm text-secondary">
            {blueprint.oneSentenceSummary}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onRestart}>
            <RotateCcw aria-hidden="true" />
            Start over
          </Button>
          <Button size="sm" onClick={download} disabled={downloading}>
            <Download aria-hidden="true" />
            {downloading ? "Preparing ZIP…" : "Download the code"}
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      ) : null}

      <Alert variant="info" className="mt-4">
        <p className="font-medium text-primary">Saved in this browser only.</p>
        <p className="mt-1">
          Guest projects live in your browser and can be lost if you clear site
          data. The downloaded code is yours to keep — a complete runnable
          starter with a README explaining exactly what is and isn&apos;t wired
          up.
        </p>
      </Alert>

      <h3 className="mt-8 text-card-title text-primary">
        Interactive prototype
      </h3>
      <PrototypePreview blueprint={blueprint} />

      <h3 className="mt-8 text-card-title text-primary">The full blueprint</h3>
      <div className="mt-3 grid gap-6 lg:grid-cols-4">
        <nav aria-label="Blueprint sections">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {BLUEPRINT_SECTIONS.map((section) => (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  aria-current={
                    activeSection === section.key ? "true" : undefined
                  }
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-body-sm transition-colors",
                    activeSection === section.key
                      ? "bg-accent-muted font-medium text-accent"
                      : "text-secondary hover:bg-surface-muted hover:text-primary",
                  )}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section
          aria-label={activeLabel}
          className="rounded-lg border border-border-subtle bg-surface p-6 shadow-card lg:col-span-3"
        >
          <h4 className="text-section-title text-primary">{activeLabel}</h4>
          <div className="mt-5">
            <SectionContent blueprint={blueprint} sectionKey={activeSection} />
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { Check, ChevronDown, History, Pencil, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SectionContent } from "@/components/blueprint/section-content";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveBlueprintAction,
  reviseBlueprintAction,
  updateBlueprintSectionAction,
} from "@/features/blueprints/actions";
import {
  BLUEPRINT_SECTIONS,
  type BlueprintSectionKey,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import { getSectionValue } from "@/features/blueprints/sections";
import type { BlueprintStatus } from "@/types/database";
import { formatRelativeTime } from "@/lib/utilities/format";
import { cn } from "@/lib/utilities/cn";

interface VersionInfo {
  versionNumber: number;
  status: BlueprintStatus;
  summary: string | null;
  createdAt: string;
}

export function BlueprintWorkspace({
  projectId,
  blueprint,
  blueprintId,
  blueprintStatus,
  versionNumber,
  isLatestVersion,
  versions,
  aiConfigured,
}: {
  projectId: string;
  blueprint: ProjectBlueprint;
  blueprintId: string;
  blueprintStatus: BlueprintStatus;
  versionNumber: number;
  isLatestVersion: boolean;
  versions: VersionInfo[];
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<BlueprintSectionKey>("overview");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [reviseValue, setReviseValue] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeLabel =
    BLUEPRINT_SECTIONS.find((section) => section.key === activeSection)
      ?.label ?? "Section";

  const canEdit = isLatestVersion && blueprintStatus !== "superseded";

  const startEditing = () => {
    setEditValue(
      JSON.stringify(getSectionValue(blueprint, activeSection), null, 2),
    );
    setError(null);
    setNotice(null);
    setEditing(true);
  };

  const saveEdit = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateBlueprintSectionAction(
        projectId,
        blueprintId,
        activeSection,
        editValue,
      );
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        setNotice("Saved as a new version.");
        router.refresh();
      }
    });
  };

  const submitRevision = () => {
    const instruction = reviseValue.trim();
    if (!instruction) return;
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await reviseBlueprintAction(
        projectId,
        blueprintId,
        instruction,
      );
      if (result.error) {
        setError(result.error);
      } else {
        setReviseValue("");
        setNotice("Revised — you are now viewing the new version.");
        router.refresh();
      }
    });
  };

  const approve = () => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await approveBlueprintAction(projectId, blueprintId);
      if (result.error) {
        setError(result.error);
      } else {
        setNotice(
          "Blueprint approved. Application generation is the next phase of Forge and is not available yet — your approved plan is saved and ready for it.",
        );
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge
            variant={
              blueprintStatus === "approved"
                ? "success"
                : blueprintStatus === "superseded"
                  ? "neutral"
                  : "accent"
            }
          >
            {blueprintStatus === "approved"
              ? "Approved"
              : blueprintStatus === "superseded"
                ? "Superseded"
                : "Draft"}
          </Badge>
          <span className="text-body-sm text-secondary">
            Version {versionNumber}
            {!isLatestVersion ? " (older version, read-only)" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowVersions((value) => !value)}
              aria-expanded={showVersions}
              aria-haspopup="listbox"
            >
              <History aria-hidden="true" />
              Versions
              <ChevronDown aria-hidden="true" />
            </Button>
            {showVersions ? (
              <ul
                role="listbox"
                aria-label="Blueprint versions"
                className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border-subtle bg-surface-elevated p-1 shadow-elevated"
              >
                {versions.map((item) => (
                  <li
                    key={item.versionNumber}
                    role="option"
                    aria-selected={item.versionNumber === versionNumber}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowVersions(false);
                        router.push(
                          `/projects/${projectId}/blueprint?version=${item.versionNumber}`,
                        );
                      }}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-body-sm hover:bg-surface-muted",
                        item.versionNumber === versionNumber
                          ? "bg-surface-muted text-primary"
                          : "text-secondary",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-medium">
                          Version {item.versionNumber}
                        </span>
                        <span className="text-caption text-muted">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </span>
                      {item.summary ? (
                        <span className="mt-0.5 block truncate text-caption text-muted">
                          {item.summary}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {canEdit && blueprintStatus !== "approved" ? (
            <Button size="sm" onClick={approve} disabled={isPending}>
              <Check aria-hidden="true" />
              Approve blueprint
            </Button>
          ) : null}
          {blueprintStatus === "approved" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/projects/${projectId}/builder`)}
            >
              Continue to builder
            </Button>
          ) : null}
        </div>
      </div>

      {notice ? (
        <Alert variant="success" className="mt-4">
          {notice}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <nav aria-label="Blueprint sections" className="lg:col-span-1">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {BLUEPRINT_SECTIONS.map((section) => (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(section.key);
                    setEditing(false);
                    setError(null);
                  }}
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

        <div className="lg:col-span-3">
          <section
            aria-label={activeLabel}
            className="rounded-lg border border-border-subtle bg-surface p-6 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-section-title text-primary">{activeLabel}</h2>
              {canEdit && !editing ? (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
              ) : null}
              {editing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  <X aria-hidden="true" />
                  Cancel
                </Button>
              ) : null}
            </div>

            <div className="mt-5">
              {editing ? (
                <div>
                  <label
                    htmlFor="section-editor"
                    className="text-body-sm text-secondary"
                  >
                    Edit this section&apos;s data directly. It is validated
                    before saving, and saving creates a new version — nothing is
                    overwritten.
                  </label>
                  <Textarea
                    id="section-editor"
                    rows={16}
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                    className="mt-2 font-mono text-code"
                    spellCheck={false}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveEdit} disabled={isPending}>
                      {isPending ? "Saving…" : "Save as new version"}
                    </Button>
                  </div>
                </div>
              ) : (
                <SectionContent
                  blueprint={blueprint}
                  sectionKey={activeSection}
                />
              )}
            </div>
          </section>

          {canEdit ? (
            <section
              aria-label="Ask Forge to revise"
              className="mt-4 rounded-lg border border-border-subtle bg-surface p-5 shadow-card"
            >
              <h2 className="flex items-center gap-2 text-card-title text-primary">
                <Sparkles className="size-4 text-accent" aria-hidden="true" />
                Ask Forge to revise
              </h2>
              <p className="mt-1 text-body-sm text-secondary">
                Describe a change in plain language — Forge updates the
                blueprint and saves it as a new version.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="revise-input" className="sr-only">
                  Revision request
                </label>
                <Textarea
                  id="revise-input"
                  rows={2}
                  value={reviseValue}
                  onChange={(event) => setReviseValue(event.target.value)}
                  placeholder='e.g. "Add a receptionist role that can manage bookings but not billing."'
                  disabled={!aiConfigured || isPending}
                  className="flex-1"
                />
                <Button
                  onClick={submitRevision}
                  disabled={!aiConfigured || isPending || !reviseValue.trim()}
                  className="sm:self-end"
                >
                  {isPending ? "Revising…" : "Revise"}
                </Button>
              </div>
              {!aiConfigured ? (
                <p className="mt-2 text-caption text-muted">
                  AI revision requires the AI provider to be configured. Manual
                  editing works without it.
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

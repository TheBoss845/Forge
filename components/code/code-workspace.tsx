"use client";

import {
  Check,
  ChevronDown,
  Download,
  FileCode,
  History,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  applyFileEditAction,
  generateApplicationAction,
  proposeFileEditAction,
  restoreVersionAction,
} from "@/features/generation/actions";
import { compactDiff, diffLines } from "@/lib/utilities/diff";
import { formatRelativeTime } from "@/lib/utilities/format";
import { cn } from "@/lib/utilities/cn";

interface FileInfo {
  path: string;
  content: string;
  language: string | null;
}

interface VersionInfo {
  id: string;
  versionNumber: number;
  description: string | null;
  createdAt: string;
}

interface Proposal {
  explanation: string;
  updatedContent: string;
  instruction: string;
}

export function CodeWorkspace({
  projectId,
  files,
  versions,
  aiConfigured,
}: {
  projectId: string;
  files: FileInfo[];
  versions: VersionInfo[];
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState(files[0]?.path ?? "");
  const [instruction, setInstruction] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedFile = files.find((file) => file.path === selectedPath);

  const diff = useMemo(() => {
    if (!proposal || !selectedFile) return null;
    return compactDiff(
      diffLines(selectedFile.content, proposal.updatedContent),
    );
  }, [proposal, selectedFile]);

  const propose = () => {
    const trimmed = instruction.trim();
    if (!trimmed || !selectedFile) return;
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await proposeFileEditAction(
        projectId,
        selectedFile.path,
        trimmed,
      );
      if (result.error) {
        setError(result.error);
      } else if (result.updatedContent && result.explanation) {
        setProposal({
          explanation: result.explanation,
          updatedContent: result.updatedContent,
          instruction: trimmed,
        });
      }
    });
  };

  const applyProposal = () => {
    if (!proposal || !selectedFile) return;
    setError(null);
    startTransition(async () => {
      const result = await applyFileEditAction(
        projectId,
        selectedFile.path,
        proposal.updatedContent,
        `AI edit: ${proposal.instruction}`,
      );
      if (result.error) {
        setError(result.error);
      } else {
        setProposal(null);
        setInstruction("");
        setNotice("Change applied and saved as a new version.");
        router.refresh();
      }
    });
  };

  const restore = (versionId: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await restoreVersionAction(projectId, versionId);
      if (result.error) {
        setError(result.error);
      } else {
        setNotice("Version restored.");
        setShowVersions(false);
        router.refresh();
      }
    });
  };

  const regenerate = () => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await generateApplicationAction(projectId);
      if (result.error) {
        setError(result.error);
      } else {
        setNotice(
          "Application regenerated from the latest blueprint. Manual and AI edits from before are still available in version history.",
        );
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-secondary">
          {files.length} generated files. Download and run with{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-code">
            npm install && npm run dev
          </code>
        </p>
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
                aria-label="Project versions"
                className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-border-subtle bg-surface-elevated p-1 shadow-elevated"
              >
                {versions.map((version, index) => (
                  <li
                    key={version.id}
                    role="option"
                    aria-selected={index === 0}
                  >
                    <div className="flex items-center justify-between gap-2 rounded-md px-3 py-2 hover:bg-surface-muted">
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-primary">
                          Version {version.versionNumber}
                          {index === 0 ? " (current)" : ""}
                        </p>
                        <p className="truncate text-caption text-muted">
                          {version.description ?? "No description"} ·{" "}
                          {formatRelativeTime(version.createdAt)}
                        </p>
                      </div>
                      {index > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => restore(version.id)}
                        >
                          Restore
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={regenerate}
            disabled={isPending}
          >
            <RefreshCw aria-hidden="true" />
            Regenerate
          </Button>
          <a
            href={`/api/projects/${projectId}/download`}
            className={buttonVariants({ size: "sm" })}
          >
            <Download aria-hidden="true" />
            Download ZIP
          </a>
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

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <nav
          aria-label="Generated files"
          className="max-h-[32rem] overflow-y-auto rounded-lg border border-border-subtle bg-surface p-2 shadow-card"
        >
          <ul>
            {files.map((file) => (
              <li key={file.path}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPath(file.path);
                    setProposal(null);
                    setError(null);
                  }}
                  aria-current={selectedPath === file.path ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left font-mono text-code transition-colors",
                    selectedPath === file.path
                      ? "bg-accent-muted text-accent"
                      : "text-secondary hover:bg-surface-muted hover:text-primary",
                  )}
                >
                  <FileCode className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{file.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <div className="rounded-lg border border-border-subtle bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
              <p className="font-mono text-code text-secondary">
                {selectedFile?.path ?? "No file selected"}
              </p>
              {proposal ? (
                <span className="text-caption font-medium text-accent">
                  Reviewing proposed change
                </span>
              ) : null}
            </div>

            {proposal && diff ? (
              <div className="max-h-[26rem] overflow-auto p-1">
                <table className="w-full">
                  <tbody>
                    {diff.map((line, index) =>
                      line.kind === "skip" ? (
                        <tr key={index}>
                          <td className="px-4 py-1 text-center font-mono text-code text-muted">
                            ⋯ {line.count} unchanged lines ⋯
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={index}
                          className={cn(
                            line.kind === "added" && "bg-success-muted",
                            line.kind === "removed" && "bg-danger-muted",
                          )}
                        >
                          <td className="px-4 whitespace-pre-wrap">
                            <span
                              className={cn(
                                "font-mono text-code",
                                line.kind === "added" && "text-success",
                                line.kind === "removed" && "text-danger",
                                line.kind === "context" && "text-secondary",
                              )}
                            >
                              {line.kind === "added"
                                ? "+ "
                                : line.kind === "removed"
                                  ? "- "
                                  : "  "}
                              {line.text}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="max-h-[26rem] overflow-auto p-4">
                <code className="font-mono text-code text-primary">
                  {selectedFile?.content ?? ""}
                </code>
              </pre>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-border-subtle bg-surface p-4 shadow-card">
            {proposal ? (
              <div>
                <h3 className="flex items-center gap-2 text-card-title text-primary">
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />
                  Proposed change
                </h3>
                <p className="mt-1 text-body-sm text-secondary">
                  {proposal.explanation}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={applyProposal}
                    disabled={isPending}
                  >
                    <Check aria-hidden="true" />
                    {isPending ? "Applying…" : "Apply change"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setProposal(null)}
                  >
                    <X aria-hidden="true" />
                    Discard
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="flex items-center gap-2 text-card-title text-primary">
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />
                  Ask Forge to modify this file
                </h3>
                <p className="mt-1 text-body-sm text-secondary">
                  Describe the change in plain language. You will see exactly
                  what changes before anything is saved.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="edit-instruction" className="sr-only">
                    Change request
                  </label>
                  <Textarea
                    id="edit-instruction"
                    rows={2}
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                    placeholder='e.g. "Change the page heading to Bookings and add a short welcome sentence."'
                    disabled={!aiConfigured || isPending}
                    className="flex-1"
                  />
                  <Button
                    onClick={propose}
                    disabled={!aiConfigured || isPending || !instruction.trim()}
                    className="sm:self-end"
                  >
                    {isPending ? "Thinking…" : "Preview change"}
                  </Button>
                </div>
                {!aiConfigured ? (
                  <p className="mt-2 text-caption text-muted">
                    AI editing requires the AI provider to be configured.
                    Downloading and regenerating work without it.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

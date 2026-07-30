"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  FolderKanban,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/auth/field-error";
import { GuestBlueprintView } from "@/components/guest/guest-blueprint-view";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { projectBlueprintSchema } from "@/features/blueprints/schema";
import { guestBusinessSchema } from "@/features/guest/schema";
import {
  guestProjectStatus,
  loadGuestStore,
  saveGuestStore,
  type GuestProject,
  type GuestStore,
} from "@/features/guest/store";
import type { InterviewTurn } from "@/features/interviews/schema";
import { INDUSTRIES } from "@/features/organizations/validation";
import { cn } from "@/lib/utilities/cn";
import { formatRelativeTime } from "@/lib/utilities/format";

const startFormSchema = guestBusinessSchema.extend({
  prompt: z
    .string()
    .trim()
    .min(
      20,
      "Describe what you need in a bit more detail — at least a sentence.",
    )
    .max(4000),
});

type StartFormValues = z.infer<typeof startFormSchema>;

// localStorage acts as an external store: read once per page load on the
// client, null during server rendering (shows the loading state).
const emptySubscribe = () => () => {};
let storeSnapshot: GuestStore | null = null;
function getStoreSnapshot(): GuestStore {
  storeSnapshot ??= loadGuestStore();
  return storeSnapshot;
}

type StoreUpdater =
  GuestStore | ((previous: GuestStore | null) => GuestStore | null);

interface AccountInfo {
  email: string;
}

export function GuestWorkspace({
  aiConfigured,
  accountsMode = "none",
}: {
  aiConfigured: boolean;
  accountsMode?: "local" | "none";
}) {
  const persisted = useSyncExternalStore(
    emptySubscribe,
    getStoreSnapshot,
    () => null,
  );
  const [override, setOverride] = useState<GuestStore | null>(null);
  const store = override ?? persisted;

  const setStore = useCallback((value: StoreUpdater) => {
    setOverride((previous) => {
      const base = previous ?? storeSnapshot;
      return typeof value === "function" ? value(base) : value;
    });
  }, []);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"turn" | "blueprint" | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const openingRequestedForRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!store) return;
    storeSnapshot = store;
    saveGuestStore(store);

    // Debounced server sync for signed-in accounts.
    if (account) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        void fetch("/api/account/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(store),
        }).catch(() => {
          // Sync is best-effort; local persistence is the safety net.
        });
      }, 800);
    }
  }, [store, account]);

  // Check for a signed-in account and adopt its synced workspace.
  useEffect(() => {
    if (accountsMode !== "local") return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/workspace");
        const data = (await response.json()) as {
          authenticated?: boolean;
          email?: string;
          store?: GuestStore | null;
        };
        if (cancelled || !data.authenticated || !data.email) return;
        setAccount({ email: data.email });
        if (data.store && Array.isArray(data.store.projects)) {
          if (data.store.projects.length > 0) {
            // The account's workspace wins over this device's copy.
            setStore({ ...data.store, activeProjectId: null });
          } else {
            // First sign-in on a device with existing local work: push it up.
            const local = storeSnapshot ?? loadGuestStore();
            if (local.projects.length > 0) {
              void fetch("/api/account/workspace", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(local),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Stay in device-only mode on any failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountsMode, setStore]);

  const activeProject =
    store?.projects.find((project) => project.id === store.activeProjectId) ??
    null;

  const updateProject = useCallback(
    (projectId: string, patch: (project: GuestProject) => GuestProject) => {
      setStore((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          projects: previous.projects.map((project) =>
            project.id === projectId ? patch(project) : project,
          ),
        };
      });
    },
    [setStore],
  );

  const requestTurn = useCallback(
    async (project: GuestProject, content: string | null) => {
      setError(null);
      setBusy("turn");

      const nextMessages = content
        ? [
            ...project.messages,
            { id: `g-${Date.now()}`, role: "user" as const, content },
          ]
        : project.messages;
      if (content) {
        updateProject(project.id, (current) => ({
          ...current,
          messages: nextMessages,
        }));
      }

      try {
        const response = await fetch("/api/guest/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business: project.business,
            prompt: project.prompt,
            transcript: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            summary: project.summary,
          }),
        });
        const data = (await response.json()) as {
          error?: string;
          turn?: InterviewTurn;
        };
        if (!response.ok || !data.turn) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        const { turn } = data;
        updateProject(project.id, (current) => ({
          ...current,
          messages: [
            ...nextMessages,
            {
              id: `g-${Date.now()}-assistant`,
              role: "assistant",
              content: turn.message,
              whyThisMatters: turn.whyThisMatters,
              suggestedAnswers: turn.suggestedAnswers,
            },
          ],
          summary: turn.updatedSummary,
          discoveryComplete:
            current.discoveryComplete || turn.discoveryComplete,
        }));
      } catch {
        setError(
          "Could not reach the server. Check your connection and try again.",
        );
      } finally {
        setBusy(null);
      }
    },
    [updateProject],
  );

  // Ask the opening question when a project enters the interview empty.
  useEffect(() => {
    if (
      aiConfigured &&
      activeProject &&
      !activeProject.blueprint &&
      activeProject.messages.length === 0 &&
      openingRequestedForRef.current !== activeProject.id
    ) {
      openingRequestedForRef.current = activeProject.id;
      void requestTurn(activeProject, null);
    }
  }, [aiConfigured, activeProject, requestTurn]);

  const generateBlueprint = async (project: GuestProject) => {
    setError(null);
    setBusy("blueprint");
    try {
      const response = await fetch("/api/guest/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: project.business,
          prompt: project.prompt,
          transcript: project.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        blueprint?: unknown;
      };
      const parsed = projectBlueprintSchema.safeParse(data.blueprint);
      if (!response.ok || !parsed.success) {
        setError(
          data.error ?? "Blueprint generation failed. Please try again.",
        );
        return;
      }
      updateProject(project.id, (current) => ({
        ...current,
        blueprint: parsed.data,
      }));
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  if (!store) {
    return (
      <div className="py-16 text-center text-body-sm text-muted" role="status">
        Loading your workspace…
      </div>
    );
  }

  if (!aiConfigured) {
    return (
      <Alert variant="info" className="mx-auto max-w-xl">
        <p className="font-medium text-primary">
          The AI is not configured on this deployment yet.
        </p>
        <p className="mt-1">
          The site owner needs to add an AI API key (for example an OpenAI key).
          The moment it is added, this page works — no database or account
          system required.
        </p>
      </Alert>
    );
  }

  const accountBar =
    accountsMode === "local" ? (
      <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-border-subtle bg-surface px-4 py-2 text-body-sm">
        {account ? (
          <>
            <span className="text-secondary">
              Signed in as{" "}
              <span className="font-medium text-primary">{account.email}</span>{" "}
              — projects sync to your account.
            </span>
            <button
              type="button"
              onClick={() => {
                setAccount(null);
                void fetch("/api/account/session", { method: "DELETE" }).then(
                  () => window.location.reload(),
                );
              }}
              className="rounded-md text-accent hover:underline"
            >
              Sign out
            </button>
          </>
        ) : (
          <span className="text-secondary">
            Saved on this device.{" "}
            <a href="/login" className="text-accent hover:underline">
              Sign in
            </a>{" "}
            to sync your projects across devices.
          </span>
        )}
      </div>
    ) : null;

  // Start form (first project, or creating another one).
  if (creating || store.projects.length === 0) {
    return (
      <div>
        {accountBar}
        {store.projects.length > 0 ? (
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="mx-auto mb-6 flex items-center gap-1.5 rounded-md text-body-sm text-secondary hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to your projects
          </button>
        ) : null}
        <GuestStartForm
          onSubmit={(values) => {
            const project: GuestProject = {
              id: `p-${Date.now()}`,
              createdAt: new Date().toISOString(),
              business: {
                businessName: values.businessName,
                industry: values.industry,
                description: values.description,
                biggestProblem: values.biggestProblem,
              },
              prompt: values.prompt,
              messages: [],
              summary: null,
              discoveryComplete: false,
              blueprint: null,
            };
            setCreating(false);
            setError(null);
            setStore((previous) => ({
              projects: [...(previous?.projects ?? []), project],
              activeProjectId: project.id,
            }));
          }}
        />
      </div>
    );
  }

  // Project list.
  if (!activeProject) {
    return (
      <div className="mx-auto max-w-3xl">
        {accountBar}
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-section-title text-primary">
            <FolderKanban className="size-5 text-accent" aria-hidden="true" />
            Your projects
          </h2>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" />
            New project
          </Button>
        </div>
        <p className="mt-1 text-body-sm text-muted">
          {account
            ? "Synced to your account."
            : "Saved on this device — no account needed."}
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {store.projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-card-title text-primary">
                  {project.blueprint?.projectName ??
                    project.business.businessName}
                </h3>
                <Badge variant={project.blueprint ? "success" : "accent"}>
                  {guestProjectStatus(project)}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-body-sm text-secondary">
                {project.prompt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-caption text-muted">
                  Started {formatRelativeTime(project.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${project.business.businessName}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this project? This cannot be undone.",
                        )
                      ) {
                        setStore((previous) =>
                          previous
                            ? {
                                ...previous,
                                projects: previous.projects.filter(
                                  (item) => item.id !== project.id,
                                ),
                              }
                            : previous,
                        );
                      }
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setStore((previous) =>
                        previous
                          ? { ...previous, activeProjectId: project.id }
                          : previous,
                      )
                    }
                  >
                    Open
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const backToProjects = () => {
    setError(null);
    setStore((previous) =>
      previous ? { ...previous, activeProjectId: null } : previous,
    );
  };

  // Blueprint view.
  if (activeProject.blueprint) {
    return (
      <div>
        <button
          type="button"
          onClick={backToProjects}
          className="mb-4 flex items-center gap-1.5 rounded-md text-body-sm text-secondary hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Your projects
        </button>
        <GuestBlueprintView
          blueprint={activeProject.blueprint}
          onRestart={backToProjects}
        />
      </div>
    );
  }

  // Interview view.
  return (
    <GuestInterview
      project={activeProject}
      busy={busy}
      error={error}
      onBack={backToProjects}
      onAnswer={(content) => void requestTurn(activeProject, content)}
      onGenerate={() => void generateBlueprint(activeProject)}
    />
  );
}

function GuestInterview({
  project,
  busy,
  error,
  onBack,
  onAnswer,
  onGenerate,
}: {
  project: GuestProject;
  busy: "turn" | "blueprint" | null;
  error: string | null;
  onBack: () => void;
  onAnswer: (content: string) => void;
  onGenerate: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [project.messages.length, busy]);

  const lastAssistant = [...project.messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const answersGiven = project.messages.filter(
    (message) => message.role === "user",
  ).length;

  const handleSend = () => {
    const content = input.trim();
    if (!content || busy) return;
    setInput("");
    onAnswer(content);
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 rounded-md text-body-sm text-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Your projects
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-label="Interview conversation"
          className="flex min-h-[26rem] flex-col rounded-lg border border-border-subtle bg-surface shadow-card lg:col-span-2"
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {project.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    message.role === "assistant"
                      ? "bg-accent-muted"
                      : "bg-surface-muted",
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="size-3.5 text-accent" aria-hidden="true" />
                  ) : (
                    <User
                      className="size-3.5 text-secondary"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-4 py-3",
                    message.role === "assistant"
                      ? "rounded-tl-none border border-border-subtle"
                      : "rounded-tr-none bg-surface-muted",
                  )}
                >
                  <p className="text-body-sm whitespace-pre-wrap text-primary">
                    {message.content}
                  </p>
                  {message.whyThisMatters ? (
                    <p className="mt-2 text-caption text-muted">
                      {message.whyThisMatters}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}

            {busy ? (
              <div className="flex items-center gap-3" role="status">
                <span className="flex size-7 items-center justify-center rounded-full bg-accent-muted">
                  <Bot className="size-3.5 text-accent" aria-hidden="true" />
                </span>
                <span className="text-body-sm text-muted">
                  {busy === "blueprint"
                    ? "Forge is drawing up your blueprint — up to a minute…"
                    : "Forge is thinking…"}
                </span>
              </div>
            ) : null}

            {error ? <Alert variant="danger">{error}</Alert> : null}
            <div ref={bottomRef} />
          </div>

          {lastAssistant?.suggestedAnswers?.length && !busy ? (
            <div className="flex flex-wrap gap-2 border-t border-border-subtle px-5 py-3">
              {lastAssistant.suggestedAnswers.map((answer) => (
                <button
                  key={answer}
                  type="button"
                  onClick={() => onAnswer(answer)}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-body-sm text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  {answer}
                </button>
              ))}
            </div>
          ) : null}

          <div className="border-t border-border-subtle p-4">
            <div className="flex items-end gap-2">
              <label htmlFor="guest-input" className="sr-only">
                Your answer
              </label>
              <Textarea
                id="guest-input"
                rows={2}
                value={input}
                placeholder="Type your answer…"
                disabled={Boolean(busy)}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={Boolean(busy) || !input.trim()}
                aria-label="Send answer"
              >
                <Send aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <Button
                type="button"
                variant={project.discoveryComplete ? "primary" : "secondary"}
                size="sm"
                disabled={Boolean(busy) || answersGiven < 1}
                onClick={onGenerate}
              >
                {busy === "blueprint" ? "Generating…" : "Generate my blueprint"}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>

        <aside
          aria-label="Business understanding"
          className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card"
        >
          <h2 className="text-card-title text-primary">What Forge knows</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between text-caption text-muted">
              <span>Discovery progress</span>
              <span>{project.summary?.progressPercent ?? 0}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={project.summary?.progressPercent ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Discovery progress"
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${project.summary?.progressPercent ?? 0}%` }}
              />
            </div>
          </div>
          {project.summary?.knownFacts.length ? (
            <ul className="mt-4 space-y-2">
              {project.summary.knownFacts.map((fact) => (
                <li
                  key={fact}
                  className="flex gap-2 text-body-sm text-secondary"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 size-1.5 shrink-0 rounded-full bg-success"
                  />
                  {fact}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-body-sm text-muted">
              Facts appear here as you answer.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

const examplePrompts = [
  "I own a veterinary clinic and need customers to book appointments online.",
  "We're a construction company and need to track job quotes and progress.",
  "Our retail store needs an inventory dashboard with low-stock alerts.",
];

function GuestStartForm({
  onSubmit,
}: {
  onSubmit: (values: StartFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StartFormValues>({ resolver: zodResolver(startFormSchema) });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto max-w-xl space-y-5"
    >
      <div>
        <Label htmlFor="businessName">Business name</Label>
        <Input
          id="businessName"
          className="mt-1.5"
          aria-invalid={Boolean(errors.businessName)}
          {...register("businessName")}
        />
        <FieldError
          id="businessName-error"
          message={errors.businessName?.message}
        />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <div className="mt-1.5">
          <Select id="industry" defaultValue="" {...register("industry")}>
            <option value="" disabled>
              Choose an industry
            </option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </Select>
        </div>
        <FieldError id="industry-error" message={errors.industry?.message} />
      </div>
      <div>
        <Label htmlFor="description">What does your business do?</Label>
        <Textarea
          id="description"
          rows={3}
          className="mt-1.5"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError
          id="description-error"
          message={errors.description?.message}
        />
      </div>
      <div>
        <Label htmlFor="biggestProblem">
          What slows your business down the most?
        </Label>
        <Textarea
          id="biggestProblem"
          rows={3}
          className="mt-1.5"
          aria-invalid={Boolean(errors.biggestProblem)}
          {...register("biggestProblem")}
        />
        <FieldError
          id="biggestProblem-error"
          message={errors.biggestProblem?.message}
        />
      </div>
      <div>
        <Label htmlFor="prompt">What should Forge build for you?</Label>
        <Textarea
          id="prompt"
          rows={4}
          className="mt-1.5"
          placeholder="I own a veterinary clinic and need customers to book appointments online…"
          aria-invalid={Boolean(errors.prompt)}
          {...register("prompt")}
        />
        <FieldError id="prompt-error" message={errors.prompt?.message} />
        <div className="mt-3 flex flex-wrap gap-2">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() =>
                setValue("prompt", prompt, { shouldValidate: true })
              }
              className="rounded-full border border-border-subtle px-3 py-1.5 text-caption text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Start the interview
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Bot, Send, User } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  projectBlueprintSchema,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import {
  guestBusinessSchema,
  type GuestBusiness,
} from "@/features/guest/schema";
import type {
  InterviewSummaryData,
  InterviewTurn,
} from "@/features/interviews/schema";
import { INDUSTRIES } from "@/features/organizations/validation";
import { cn } from "@/lib/utilities/cn";

const STORAGE_KEY = "forge.guest.v1";

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

interface GuestMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  whyThisMatters?: string;
  suggestedAnswers?: string[];
}

interface GuestState {
  step: "start" | "interview" | "blueprint";
  business: GuestBusiness | null;
  prompt: string;
  messages: GuestMessage[];
  summary: InterviewSummaryData | null;
  discoveryComplete: boolean;
  blueprint: ProjectBlueprint | null;
}

const initialState: GuestState = {
  step: "start",
  business: null,
  prompt: "",
  messages: [],
  summary: null,
  discoveryComplete: false,
  blueprint: null,
};

function loadState(): GuestState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as GuestState;
    if (parsed.blueprint) {
      const valid = projectBlueprintSchema.safeParse(parsed.blueprint);
      if (!valid.success)
        return { ...parsed, blueprint: null, step: "interview" };
    }
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

// localStorage acts as an external store: read once per page load on the
// client, null during server rendering (shows the loading state).
const emptySubscribe = () => () => {};
let persistedSnapshot: GuestState | null = null;
function getPersistedSnapshot(): GuestState {
  persistedSnapshot ??= loadState();
  return persistedSnapshot;
}

type StateUpdater =
  GuestState | ((previous: GuestState | null) => GuestState | null);

export function GuestWorkspace({ aiConfigured }: { aiConfigured: boolean }) {
  const persisted = useSyncExternalStore(
    emptySubscribe,
    getPersistedSnapshot,
    () => null,
  );
  const [override, setOverride] = useState<GuestState | null>(null);
  const state = override ?? persisted;

  const setState = useCallback((value: StateUpdater) => {
    setOverride((previous) => {
      const base = previous ?? persistedSnapshot;
      return typeof value === "function" ? value(base) : value;
    });
  }, []);

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"turn" | "blueprint" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openingRequestedRef = useRef(false);

  useEffect(() => {
    if (!state) return;
    persistedSnapshot = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is best-effort.
    }
  }, [state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state?.messages.length, busy]);

  const requestTurn = async (current: GuestState, content: string | null) => {
    if (!current.business) return;
    setError(null);
    setBusy("turn");

    const nextMessages = content
      ? [
          ...current.messages,
          {
            id: `g-${Date.now()}`,
            role: "user" as const,
            content,
          },
        ]
      : current.messages;
    setState({ ...current, messages: nextMessages });

    try {
      const response = await fetch("/api/guest/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: current.business,
          prompt: current.prompt,
          transcript: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          summary: current.summary,
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
      setState((previous) =>
        previous
          ? {
              ...previous,
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
                previous.discoveryComplete || turn.discoveryComplete,
            }
          : previous,
      );
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  // Ask the opening question when entering the interview with no messages.
  useEffect(() => {
    if (
      state &&
      state.step === "interview" &&
      state.messages.length === 0 &&
      aiConfigured &&
      !openingRequestedRef.current
    ) {
      openingRequestedRef.current = true;
      void requestTurn(state, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when interview starts empty
  }, [state?.step]);

  const generateBlueprint = async () => {
    if (!state?.business) return;
    setError(null);
    setBusy("blueprint");
    try {
      const response = await fetch("/api/guest/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: state.business,
          prompt: state.prompt,
          transcript: state.messages.map((message) => ({
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
      setState((previous) =>
        previous
          ? { ...previous, blueprint: parsed.data, step: "blueprint" }
          : previous,
      );
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  const restart = () => {
    openingRequestedRef.current = false;
    setInput("");
    setError(null);
    setState(initialState);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  };

  if (!state) {
    return (
      <div className="py-16 text-center text-body-sm text-muted" role="status">
        Loading…
      </div>
    );
  }

  if (!aiConfigured) {
    return (
      <Alert variant="info">
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

  if (state.step === "start") {
    return (
      <GuestStartForm
        onSubmit={(values) => {
          openingRequestedRef.current = false;
          setState({
            ...initialState,
            step: "interview",
            business: {
              businessName: values.businessName,
              industry: values.industry,
              description: values.description,
              biggestProblem: values.biggestProblem,
            },
            prompt: values.prompt,
          });
        }}
      />
    );
  }

  if (state.step === "blueprint" && state.blueprint) {
    return (
      <GuestBlueprintView blueprint={state.blueprint} onRestart={restart} />
    );
  }

  const lastAssistant = [...state.messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const answersGiven = state.messages.filter(
    (message) => message.role === "user",
  ).length;

  const handleSend = () => {
    const content = input.trim();
    if (!content || busy) return;
    setInput("");
    void requestTurn(state, content);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section
        aria-label="Interview conversation"
        className="flex min-h-[26rem] flex-col rounded-lg border border-border-subtle bg-surface shadow-card lg:col-span-2"
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {state.messages.map((message) => (
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
                onClick={() => void requestTurn(state, answer)}
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
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={restart}
              className="rounded-md text-body-sm text-muted hover:text-primary"
            >
              Start over
            </button>
            <Button
              type="button"
              variant={state.discoveryComplete ? "primary" : "secondary"}
              size="sm"
              disabled={Boolean(busy) || answersGiven < 1}
              onClick={generateBlueprint}
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
            <span>{state.summary?.progressPercent ?? 0}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={state.summary?.progressPercent ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Discovery progress"
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${state.summary?.progressPercent ?? 0}%` }}
            />
          </div>
        </div>
        {state.summary?.knownFacts.length ? (
          <ul className="mt-4 space-y-2">
            {state.summary.knownFacts.map((fact) => (
              <li key={fact} className="flex gap-2 text-body-sm text-secondary">
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
  );
}

function GuestStartForm({
  onSubmit,
}: {
  onSubmit: (values: StartFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
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

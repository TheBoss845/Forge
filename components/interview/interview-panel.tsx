"use client";

import { ArrowRight, Bot, Send, SkipForward, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  completeInterviewAction,
  sendInterviewMessageAction,
} from "@/features/interviews/actions";
import type { InterviewSummaryData } from "@/features/interviews/schema";
import { cn } from "@/lib/utilities/cn";

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  whyThisMatters?: string;
  suggestedAnswers?: string[];
}

export function InterviewPanel({
  projectId,
  initialMessages,
  initialSummary,
  aiConfigured,
}: {
  projectId: string;
  initialMessages: DisplayMessage[];
  initialSummary: InterviewSummaryData | null;
  aiConfigured: boolean;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages);
  const [summary, setSummary] = useState<InterviewSummaryData | null>(
    initialSummary,
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [discoveryComplete, setDiscoveryComplete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isContinuing, startContinue] = useTransition();

  const bottomRef = useRef<HTMLDivElement>(null);
  const openingRequestedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isPending]);

  const requestTurn = (content: string | null) => {
    setError(null);
    if (content) {
      setMessages((current) => [
        ...current,
        { id: `local-${Date.now()}`, role: "user", content },
      ]);
    }
    startTransition(async () => {
      const result = await sendInterviewMessageAction(projectId, content);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.turn) {
        const { turn } = result;
        setMessages((current) => [
          ...current,
          {
            id: `local-${Date.now()}-assistant`,
            role: "assistant",
            content: turn.message,
            whyThisMatters: turn.whyThisMatters,
            suggestedAnswers: turn.suggestedAnswers,
          },
        ]);
        setSummary(turn.updatedSummary);
        if (turn.discoveryComplete) setDiscoveryComplete(true);
      }
    });
  };

  // Request the opening question when the interview is empty.
  useEffect(() => {
    if (
      aiConfigured &&
      initialMessages.length === 0 &&
      !openingRequestedRef.current
    ) {
      openingRequestedRef.current = true;
      requestTurn(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const handleSend = () => {
    const content = input.trim();
    if (!content || isPending) return;
    setInput("");
    requestTurn(content);
  };

  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <section
        aria-label="Interview conversation"
        className="flex min-h-[28rem] flex-col rounded-lg border border-border-subtle bg-surface shadow-card lg:col-span-2"
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {!aiConfigured ? (
            <Alert variant="info">
              <p className="font-medium text-primary">
                The AI interviewer is not configured yet.
              </p>
              <p className="mt-1">
                This deployment is missing its AI provider credentials
                (AI_PROVIDER, AI_MODEL, AI_API_KEY). Your project is saved and
                the interview will work as soon as they are added.
              </p>
            </Alert>
          ) : null}

          {messages.map((message) => (
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

          {isPending ? (
            <div className="flex items-center gap-3" role="status">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent-muted">
                <Bot className="size-3.5 text-accent" aria-hidden="true" />
              </span>
              <span className="text-body-sm text-muted">
                Forge is thinking…
              </span>
            </div>
          ) : null}

          {error ? (
            <Alert variant="danger">
              <p>{error}</p>
              {aiConfigured ? (
                <button
                  type="button"
                  onClick={() => requestTurn(null)}
                  className="mt-2 rounded-md text-body-sm font-medium text-accent hover:underline"
                >
                  Try again
                </button>
              ) : null}
            </Alert>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {lastAssistant?.suggestedAnswers?.length && !isPending ? (
          <div className="flex flex-wrap gap-2 border-t border-border-subtle px-5 py-3">
            {lastAssistant.suggestedAnswers.map((answer) => (
              <button
                key={answer}
                type="button"
                onClick={() => requestTurn(answer)}
                className="rounded-full border border-border-subtle px-3 py-1.5 text-body-sm text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                {answer}
              </button>
            ))}
          </div>
        ) : null}

        <div className="border-t border-border-subtle p-4">
          <div className="flex items-end gap-2">
            <label htmlFor="interview-input" className="sr-only">
              Your answer
            </label>
            <Textarea
              id="interview-input"
              rows={2}
              value={input}
              placeholder={
                aiConfigured
                  ? "Type your answer…"
                  : "Waiting for AI configuration…"
              }
              disabled={!aiConfigured || isPending}
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
              disabled={!aiConfigured || isPending || !input.trim()}
              aria-label="Send answer"
            >
              <Send aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!aiConfigured || isPending || messages.length === 0}
                onClick={() => requestTurn("Let's skip this question for now.")}
              >
                <SkipForward aria-hidden="true" />
                Skip question
              </Button>
              <Link
                href="/dashboard"
                className="rounded-md text-body-sm text-muted hover:text-primary"
              >
                Save and leave
              </Link>
            </div>
            <Button
              type="button"
              variant={discoveryComplete ? "primary" : "secondary"}
              size="sm"
              disabled={isContinuing || messages.length < 2}
              onClick={() =>
                startContinue(async () => {
                  const result = await completeInterviewAction(projectId);
                  if (result?.error) setError(result.error);
                })
              }
            >
              {isContinuing ? "Continuing…" : "Continue to blueprint"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <aside
        aria-label="Business understanding"
        className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card"
      >
        <h2 className="text-card-title text-primary">Business understanding</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between text-caption text-muted">
            <span>Discovery progress</span>
            <span>{summary?.progressPercent ?? 0}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={summary?.progressPercent ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Discovery progress"
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${summary?.progressPercent ?? 0}%` }}
            />
          </div>
        </div>

        <h3 className="mt-6 text-caption font-semibold tracking-wide text-muted uppercase">
          What Forge knows
        </h3>
        {summary?.knownFacts.length ? (
          <ul className="mt-2 space-y-2">
            {summary.knownFacts.map((fact) => (
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
          <p className="mt-2 text-body-sm text-muted">
            Nothing yet — facts appear here as you answer.
          </p>
        )}

        <h3 className="mt-6 text-caption font-semibold tracking-wide text-muted uppercase">
          Still exploring
        </h3>
        {summary?.openTopics.length ? (
          <ul className="mt-2 space-y-2">
            {summary.openTopics.map((topic) => (
              <li
                key={topic}
                className="flex gap-2 text-body-sm text-secondary"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 size-1.5 shrink-0 rounded-full bg-warning"
                />
                {topic}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-body-sm text-muted">
            Open topics appear here during the interview.
          </p>
        )}
      </aside>
    </div>
  );
}

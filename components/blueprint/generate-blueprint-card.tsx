"use client";

import { FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateBlueprintAction } from "@/features/blueprints/actions";

export function GenerateBlueprintCard({
  projectId,
  aiConfigured,
}: {
  projectId: string;
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateBlueprintAction(projectId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Card className="mt-8">
      <CardContent className="flex flex-col items-center py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-muted">
          <FileText className="size-6 text-accent" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-section-title text-primary">
          Generate the project blueprint
        </h2>
        <p className="mt-2 max-w-md text-body-sm text-secondary">
          Forge will combine your business profile and interview answers into a
          complete plan: users, roles, features, pages, data models, and
          workflows — all editable before anything is built.
        </p>

        {!aiConfigured ? (
          <Alert variant="info" className="mt-6 max-w-md text-left">
            <p className="font-medium text-primary">
              AI provider not configured.
            </p>
            <p className="mt-1">
              Blueprint generation needs AI credentials (AI_PROVIDER, AI_MODEL,
              AI_API_KEY). Everything you have entered is saved and this will
              work the moment they are added.
            </p>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="danger" className="mt-6 max-w-md text-left">
            {error}
          </Alert>
        ) : null}

        <Button
          size="lg"
          className="mt-6"
          onClick={generate}
          disabled={!aiConfigured || isPending}
        >
          <Sparkles aria-hidden="true" />
          {isPending
            ? "Generating — this can take a minute…"
            : "Generate blueprint"}
        </Button>
        {isPending ? (
          <p className="mt-3 text-caption text-muted" role="status">
            Forge is planning your application. Stay on this page.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

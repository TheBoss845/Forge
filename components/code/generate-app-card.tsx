"use client";

import { Hammer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateApplicationAction } from "@/features/generation/actions";

export function GenerateAppCard({
  projectId,
  hasBlueprint,
}: {
  projectId: string;
  hasBlueprint: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateApplicationAction(projectId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col items-center py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-muted">
          <Hammer className="size-6 text-accent" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-section-title text-primary">
          Generate your application
        </h2>
        <p className="mt-2 max-w-md text-body-sm text-secondary">
          Forge turns your blueprint into a complete, runnable starter codebase:
          every page, navigation, typed data models, sample data, and a
          ready-to-apply database schema. You can download it, run it, and
          modify it — by hand or by asking Forge.
        </p>
        <p className="mt-2 max-w-md text-body-sm text-muted">
          Honest scope: the starter uses sample data until you connect a
          database, and its README says exactly what is and isn&apos;t wired up.
        </p>

        {error ? (
          <Alert variant="danger" className="mt-6 max-w-md text-left">
            {error}
          </Alert>
        ) : null}

        {hasBlueprint ? (
          <Button
            size="lg"
            className="mt-6"
            onClick={generate}
            disabled={isPending}
          >
            {isPending
              ? "Generating your application…"
              : "Generate application"}
          </Button>
        ) : (
          <Link
            href={`/projects/${projectId}/blueprint`}
            className={`${buttonVariants({ variant: "secondary" })} mt-6`}
          >
            Create a blueprint first
          </Link>
        )}
        {isPending ? (
          <p className="mt-3 text-caption text-muted" role="status">
            Planning structure, designing the database schema, and writing
            files. This takes a few seconds.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

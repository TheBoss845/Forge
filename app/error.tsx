"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for diagnostics without exposing details to the user.
    console.error("Unhandled application error", error.digest ?? "");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-page-title text-primary">Something went wrong</h1>
      <p className="mt-2 max-w-md text-body-sm text-secondary">
        An unexpected error occurred. Your saved data is not affected. You can
        try again, or return to the dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}

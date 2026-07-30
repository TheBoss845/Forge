import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utilities/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-body-sm text-primary transition-colors",
        "placeholder:text-muted",
        "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

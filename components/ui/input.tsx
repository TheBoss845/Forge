import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utilities/cn";

export function Input({
  className,
  type,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-body-sm text-primary transition-colors",
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

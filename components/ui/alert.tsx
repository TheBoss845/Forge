import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utilities/cn";

const alertVariants = cva(
  "flex items-start gap-3 rounded-md border px-4 py-3 text-body-sm",
  {
    variants: {
      variant: {
        info: "border-border-subtle bg-surface-muted text-secondary",
        success: "border-success/30 bg-success-muted text-primary",
        danger: "border-danger/30 bg-danger-muted text-primary",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const icons = {
  info: Info,
  success: CheckCircle2,
  danger: AlertCircle,
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export function Alert({ className, variant, children, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          variant === "success" && "text-success",
          variant === "danger" && "text-danger",
          (variant === "info" || !variant) && "text-secondary",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

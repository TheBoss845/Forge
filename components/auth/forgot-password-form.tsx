"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/features/auth/actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/validation";

export function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (values: ForgotPasswordInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(values);
      if (result?.error) setServerError(result.error);
      else if (result?.message) setSuccessMessage(result.message);
    });
  };

  if (successMessage) {
    return <Alert variant="success">{successMessage}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError ? <Alert variant="danger">{serverError}</Alert> : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1.5"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!configured || isPending}
      >
        {isPending ? "Sending link…" : "Send reset link"}
      </Button>

      <p className="text-center text-body-sm text-secondary">
        Remembered it?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

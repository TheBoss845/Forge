"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/features/auth/profile-actions";

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "Name is too long."),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({
  defaultFullName,
  email,
}: {
  defaultFullName: string;
  email: string;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: defaultFullName },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result?.error) setServerError(result.error);
      else if (result?.message) setSuccessMessage(result.message);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError ? <Alert variant="danger">{serverError}</Alert> : null}
      {successMessage ? (
        <Alert variant="success">{successMessage}</Alert>
      ) : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="mt-1.5" />
        <p className="mt-1.5 text-caption text-muted">
          Email changes are not supported yet.
        </p>
      </div>

      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          className="mt-1.5"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          {...register("fullName")}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

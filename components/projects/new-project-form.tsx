"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/features/projects/actions";
import {
  newProjectSchema,
  type NewProjectInput,
} from "@/features/projects/validation";

const examplePrompts = [
  "I own a veterinary clinic and need customers to book appointments online. Employees should see the schedule, update appointment status, and send reminders.",
  "We're a small construction company. I need a system to track job quotes, approve them, and see which jobs are in progress.",
  "Our retail store needs an inventory dashboard across two locations with low-stock alerts.",
  "I run a consulting firm and want a client portal where customers can see project status and shared documents.",
];

export function NewProjectForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewProjectInput>({ resolver: zodResolver(newProjectSchema) });

  const onSubmit = (values: NewProjectInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createProjectAction(values);
      if (result?.error) setServerError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError ? <Alert variant="danger">{serverError}</Alert> : null}

      <div>
        <Label htmlFor="prompt">What should Forge build for you?</Label>
        <Textarea
          id="prompt"
          rows={6}
          className="mt-1.5 text-body"
          placeholder="Describe your business and the problem you want software to solve…"
          aria-invalid={Boolean(errors.prompt)}
          aria-describedby={errors.prompt ? "prompt-error" : undefined}
          {...register("prompt")}
        />
        <FieldError id="prompt-error" message={errors.prompt?.message} />
      </div>

      <div>
        <p className="text-body-sm font-medium text-primary">
          Need inspiration? Start from an example:
        </p>
        <ul className="mt-3 space-y-2">
          {examplePrompts.map((prompt) => (
            <li key={prompt}>
              <button
                type="button"
                onClick={() =>
                  setValue("prompt", prompt, { shouldValidate: true })
                }
                className="w-full rounded-md border border-border-subtle bg-surface px-4 py-3 text-left text-body-sm text-secondary transition-colors hover:border-border-strong hover:text-primary"
              >
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Creating project…" : "Start the interview"}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboardingAction } from "@/features/organizations/actions";
import {
  INDUSTRIES,
  ONBOARDING_STEPS,
  TEAM_SIZES,
  onboardingSchema,
  type OnboardingInput,
} from "@/features/organizations/validation";

const DRAFT_KEY = "forge.onboarding.draft";

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
  });

  // Restore a saved draft so users can leave and come back mid-onboarding.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) reset(JSON.parse(raw) as Partial<OnboardingInput>);
    } catch {
      // Draft restoration is best-effort only.
    }
  }, [reset]);

  const saveDraft = () => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
    } catch {
      // Ignore storage failures (private mode, quota).
    }
  };

  const currentStep = ONBOARDING_STEPS[step];
  const isLastStep = step === ONBOARDING_STEPS.length - 1;

  const goNext = async () => {
    const valid = await trigger(currentStep.fields, { shouldFocus: true });
    if (!valid) return;
    saveDraft();
    setStep((value) => Math.min(value + 1, ONBOARDING_STEPS.length - 1));
  };

  const goBack = () => {
    saveDraft();
    setStep((value) => Math.max(value - 1, 0));
  };

  const onSubmit = (values: OnboardingInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await completeOnboardingAction(values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        try {
          window.localStorage.removeItem(DRAFT_KEY);
        } catch {
          // Ignore.
        }
      }
    });
  };

  return (
    <div>
      <nav aria-label="Onboarding progress" className="mb-8">
        <ol className="flex items-center gap-2">
          {ONBOARDING_STEPS.map((item, index) => (
            <li key={item.title} className="flex flex-1 flex-col gap-1.5">
              <span
                className={`h-1 rounded-full ${
                  index <= step ? "bg-accent" : "bg-border-subtle"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-caption ${
                  index === step ? "font-medium text-primary" : "text-muted"
                }`}
                aria-current={index === step ? "step" : undefined}
              >
                {item.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="text-section-title text-primary">{currentStep.title}</h1>
      <p className="mt-1 text-body-sm text-secondary">
        {currentStep.description}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-5"
      >
        {serverError ? <Alert variant="danger">{serverError}</Alert> : null}

        {step === 0 ? (
          <>
            <div>
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                className="mt-1.5"
                autoComplete="organization"
                aria-invalid={Boolean(errors.businessName)}
                aria-describedby={
                  errors.businessName ? "businessName-error" : undefined
                }
                {...register("businessName")}
              />
              <FieldError
                id="businessName-error"
                message={errors.businessName?.message}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <div className="mt-1.5">
                <Select
                  id="industry"
                  defaultValue=""
                  aria-invalid={Boolean(errors.industry)}
                  aria-describedby={
                    errors.industry ? "industry-error" : undefined
                  }
                  {...register("industry")}
                >
                  <option value="" disabled>
                    Choose an industry
                  </option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Select>
              </div>
              <FieldError
                id="industry-error"
                message={errors.industry?.message}
              />
            </div>
            <div>
              <Label htmlFor="teamSize">Team size</Label>
              <div className="mt-1.5">
                <Select
                  id="teamSize"
                  defaultValue=""
                  aria-invalid={Boolean(errors.teamSize)}
                  aria-describedby={
                    errors.teamSize ? "teamSize-error" : undefined
                  }
                  {...register("teamSize")}
                >
                  <option value="" disabled>
                    Choose team size
                  </option>
                  {TEAM_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </div>
              <FieldError
                id="teamSize-error"
                message={errors.teamSize?.message}
              />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <Label htmlFor="description">What does your business do?</Label>
              <Textarea
                id="description"
                rows={4}
                className="mt-1.5"
                placeholder="We are a family-run veterinary clinic serving the north side of Austin…"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                {...register("description")}
              />
              <FieldError
                id="description-error"
                message={errors.description?.message}
              />
            </div>
            <div>
              <Label htmlFor="location">
                Location or service area{" "}
                <span className="font-normal text-muted">(optional)</span>
              </Label>
              <Input
                id="location"
                className="mt-1.5"
                placeholder="Austin, Texas"
                {...register("location")}
              />
              <FieldError
                id="location-error"
                message={errors.location?.message}
              />
            </div>
            <div>
              <Label htmlFor="mainCustomerType">
                Who are your main customers?
              </Label>
              <Input
                id="mainCustomerType"
                className="mt-1.5"
                placeholder="Pet owners in our neighborhood, mostly dogs and cats"
                aria-invalid={Boolean(errors.mainCustomerType)}
                aria-describedby={
                  errors.mainCustomerType ? "mainCustomerType-error" : undefined
                }
                {...register("mainCustomerType")}
              />
              <FieldError
                id="mainCustomerType-error"
                message={errors.mainCustomerType?.message}
              />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <Label htmlFor="currentTools">
                What tools do you use today?{" "}
                <span className="font-normal text-muted">(optional)</span>
              </Label>
              <Input
                id="currentTools"
                className="mt-1.5"
                placeholder="Paper calendar, spreadsheets, QuickBooks…"
                {...register("currentTools")}
              />
              <FieldError
                id="currentTools-error"
                message={errors.currentTools?.message}
              />
            </div>
            <div>
              <Label htmlFor="biggestProblem">
                What slows your business down the most?
              </Label>
              <Textarea
                id="biggestProblem"
                rows={4}
                className="mt-1.5"
                placeholder="We spend hours on the phone booking appointments, and no-shows cost us real money…"
                aria-invalid={Boolean(errors.biggestProblem)}
                aria-describedby={
                  errors.biggestProblem ? "biggestProblem-error" : undefined
                }
                {...register("biggestProblem")}
              />
              <FieldError
                id="biggestProblem-error"
                message={errors.biggestProblem?.message}
              />
            </div>
            <div>
              <Label htmlFor="desiredOutcome">
                What would success look like?
              </Label>
              <Textarea
                id="desiredOutcome"
                rows={3}
                className="mt-1.5"
                placeholder="Customers book themselves online and the front desk stops drowning in calls."
                aria-invalid={Boolean(errors.desiredOutcome)}
                aria-describedby={
                  errors.desiredOutcome ? "desiredOutcome-error" : undefined
                }
                {...register("desiredOutcome")}
              />
              <FieldError
                id="desiredOutcome-error"
                message={errors.desiredOutcome?.message}
              />
            </div>
          </>
        ) : null}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 0 || isPending}
          >
            <ArrowLeft aria-hidden="true" />
            Back
          </Button>
          {isLastStep ? (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Setting up your workspace…" : "Finish setup"}
            </Button>
          ) : (
            <Button type="button" onClick={goNext}>
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

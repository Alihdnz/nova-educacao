"use client";

import { ArrowRight, LoaderCircle, RotateCcw } from "lucide-react";
import { useActionState } from "react";

import {
  initialAssessmentMutationState,
  type AssessmentMutationState,
} from "@/lib/assessment-mutation-state";
import { Button } from "@/components/ui/button";

export function StartAssessmentForm({
  action,
  label = "Iniciar avaliação",
}: {
  action: (
    state: AssessmentMutationState,
    formData: FormData,
  ) => Promise<AssessmentMutationState>;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAssessmentMutationState,
  );
  const resuming = label.startsWith("Retomar");

  return (
    <form action={formAction} className="space-y-2">
      <Button disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : resuming ? (
          <RotateCcw aria-hidden="true" />
        ) : (
          <ArrowRight aria-hidden="true" />
        )}
        {pending ? "Preparando..." : label}
      </Button>
      {state.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

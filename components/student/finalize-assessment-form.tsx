"use client";

import { Flag, LoaderCircle, TriangleAlert } from "lucide-react";
import { useActionState } from "react";

import {
  initialAssessmentMutationState,
  type AssessmentMutationState,
} from "@/lib/assessment-mutation-state";
import { Button } from "@/components/ui/button";

export function FinalizeAssessmentForm({
  action,
  answered,
  disabled,
  total,
}: {
  action: (
    state: AssessmentMutationState,
    formData: FormData,
  ) => Promise<AssessmentMutationState>;
  answered: number;
  disabled: boolean;
  total: number;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAssessmentMutationState,
  );
  const unanswered = Math.max(0, total - answered);

  return (
    <form action={formAction} className="space-y-3 border-t pt-6">
      {unanswered > 0 ? (
        <p className="flex items-start gap-2 text-sm text-[var(--nova-warning)]">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Você possui questões não respondidas. Elas serão consideradas
          incorretas, mas a finalização continua permitida.
        </p>
      ) : (
        <p className="text-sm text-[var(--nova-success)]">
          Todas as {total} questões foram respondidas.
        </p>
      )}
      <Button disabled={disabled || pending} size="lg" type="submit">
        {pending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <Flag aria-hidden="true" />
        )}
        {pending ? "Finalizando..." : "Finalizar avaliação"}
      </Button>
      {state.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useRef } from "react";

import {
  initialAssessmentMutationState,
  type AssessmentMutationState,
} from "@/lib/assessment-mutation-state";
import { cn } from "@/lib/utils";

type AssessmentAnswerOption = {
  id: string;
  order: number;
  text: string;
};

export function AssessmentQuestionForm({
  action,
  answers,
  disabled,
  selectedAnswerId,
}: {
  action: (
    state: AssessmentMutationState,
    formData: FormData,
  ) => Promise<AssessmentMutationState>;
  answers: AssessmentAnswerOption[];
  disabled: boolean;
  selectedAnswerId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAssessmentMutationState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={formAction} ref={formRef}>
      <fieldset
        className="space-y-2"
        disabled={disabled || pending}
        onChange={() => formRef.current?.requestSubmit()}
      >
        <legend className="sr-only">Selecione uma alternativa</legend>
        {answers.map((answer) => (
          <label
            className={cn(
              "flex min-h-12 cursor-pointer items-start gap-3 rounded-md border bg-background p-3 text-sm leading-6 transition-colors hover:bg-muted/60",
              answer.id === selectedAnswerId && "border-primary/40 bg-primary/5",
              (disabled || pending) && "cursor-not-allowed opacity-70",
            )}
            key={answer.id}
          >
            <input
              className="mt-1.5 size-4 shrink-0 accent-[var(--primary)]"
              defaultChecked={answer.id === selectedAnswerId}
              name="answerId"
              type="radio"
              value={answer.id}
            />
            <span className="min-w-0 break-words">
              <span className="mr-1 font-medium">
                {String.fromCharCode(64 + answer.order)}.
              </span>
              {answer.text}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-2 min-h-5 text-xs" aria-live="polite">
        {pending ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
            Salvando resposta...
          </span>
        ) : state.message ? (
          <span
            className={
              state.status === "error" ? "text-destructive" : "text-[var(--nova-success)]"
            }
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

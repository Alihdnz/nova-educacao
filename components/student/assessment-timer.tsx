"use client";

import { Clock3, LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  initialAssessmentMutationState,
  type AssessmentMutationState,
} from "@/lib/assessment-mutation-state";

function remainingSeconds(expiresAt: string) {
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1_000),
  );
}

function formattedTime(seconds: number) {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remaining = seconds % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function AssessmentTimer({
  action,
  expiresAt,
  initialSeconds,
}: {
  action: (
    state: AssessmentMutationState,
    formData: FormData,
  ) => Promise<AssessmentMutationState>;
  expiresAt: string;
  initialSeconds: number;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAssessmentMutationState,
  );
  const [seconds, setSeconds] = useState(initialSeconds);
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    const update = () => setSeconds(remainingSeconds(expiresAt));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (seconds === 0 && !submitted.current) {
      submitted.current = true;
      formRef.current?.requestSubmit();
    }
  }, [seconds]);

  return (
    <form
      action={formAction}
      className="sticky top-20 z-20 flex min-h-14 flex-wrap items-center justify-between gap-3 border-y bg-background/95 py-3 backdrop-blur"
      ref={formRef}
    >
      <p className="inline-flex items-center gap-2 text-sm font-medium">
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Clock3 aria-hidden="true" className="size-4 text-primary" />
        )}
        {seconds > 0 ? (
          <>
            Tempo restante
            <span className="font-semibold tabular-nums">
              {formattedTime(seconds)}
            </span>
          </>
        ) : pending ? (
          "Finalizando tentativa..."
        ) : (
          "Tempo esgotado"
        )}
      </p>
      {state.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="sr-only" tabIndex={-1} type="submit">
        Finalizar por tempo esgotado
      </button>
    </form>
  );
}

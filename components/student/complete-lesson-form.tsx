"use client";

import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { useActionState } from "react";

import type { CompleteLessonState } from "@/app/student/lesson-actions";
import { Button } from "@/components/ui/button";

const initialState: CompleteLessonState = { status: "idle" };

export function CompleteLessonForm({
  action,
  completed,
}: {
  action: (
    state: CompleteLessonState,
    formData: FormData,
  ) => Promise<CompleteLessonState>;
  completed: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  if (completed) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--nova-success)]">
        <CircleCheckBig aria-hidden="true" className="size-4" />
        Aula concluída
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <Button className="h-9" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <CircleCheckBig aria-hidden="true" />
        )}
        {pending ? "Registrando..." : "Marcar como concluída"}
      </Button>
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-[var(--nova-success)]"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

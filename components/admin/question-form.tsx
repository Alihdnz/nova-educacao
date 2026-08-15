"use client";

import { ArrowDown, ArrowUp, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StructureStatus } from "@/lib/course-structure-validation";
import {
  initialQuestionFormState,
  type QuestionDifficultyValue,
  type QuestionFormState,
  type QuestionTypeValue,
} from "@/lib/question-validation";
import { cn } from "@/lib/utils";

type QuestionFormAction = (
  state: QuestionFormState,
  formData: FormData,
) => Promise<QuestionFormState>;

type AnswerRow = {
  id?: string;
  isCorrect: boolean;
  key: string;
  text: string;
};

type QuestionDefaults = {
  answers?: Array<{ id: string; isCorrect: boolean; text: string }>;
  difficulty?: QuestionDifficultyValue;
  explanation?: string | null;
  order?: number;
  prompt?: string;
  status?: StructureStatus;
  type?: QuestionTypeValue;
};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="text-sm text-destructive">{errors[0]}</p> : null;
}

function rowKey() {
  return `answer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function initialAnswers(defaults?: QuestionDefaults): AnswerRow[] {
  if (defaults?.answers?.length) {
    return defaults.answers.map((answer) => ({ ...answer, key: answer.id }));
  }
  return [
    { isCorrect: true, key: "initial-a", text: "" },
    { isCorrect: false, key: "initial-b", text: "" },
  ];
}

export function QuestionForm({
  action,
  cancelHref,
  defaults,
  maximumOrder,
  submitLabel,
}: {
  action: QuestionFormAction;
  cancelHref: string;
  defaults?: QuestionDefaults;
  maximumOrder: number;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialQuestionFormState);
  const [type, setType] = useState<QuestionTypeValue>(defaults?.type ?? "SINGLE_CHOICE");
  const [answers, setAnswers] = useState<AnswerRow[]>(() => initialAnswers(defaults));

  function updateAnswer(key: string, text: string) {
    setAnswers((current) => current.map((answer) => (answer.key === key ? { ...answer, text } : answer)));
  }

  function setCorrect(key: string) {
    setAnswers((current) => current.map((answer) => ({ ...answer, isCorrect: answer.key === key })));
  }

  function moveAnswer(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= answers.length) return;
    setAnswers((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeAnswer(key: string) {
    if (answers.length <= 2) return;
    setAnswers((current) => {
      const next = current.filter((answer) => answer.key !== key);
      if (!next.some((answer) => answer.isCorrect)) next[0] = { ...next[0], isCorrect: true };
      return next;
    });
  }

  function changeType(nextType: QuestionTypeValue) {
    setType(nextType);
    if (nextType === "TRUE_FALSE") {
      setAnswers([
        { isCorrect: true, key: rowKey(), text: "Verdadeiro" },
        { isCorrect: false, key: rowKey(), text: "Falso" },
      ]);
    }
  }

  const serializedAnswers = JSON.stringify(
    answers.map(({ id, isCorrect, text }) => ({ id, isCorrect, text })),
  );

  return (
    <form action={formAction} className="overflow-hidden rounded-lg border bg-background">
      <input name="answers" type="hidden" value={serializedAnswers} />
      {state.message ? (
        <p className="m-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <section aria-labelledby="question-information" className="space-y-5 p-5 sm:p-6">
        <h2 className="text-sm font-semibold" id="question-information">Informações</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="prompt">Enunciado</label>
          <Textarea
            aria-invalid={state.errors?.prompt?.length ? true : undefined}
            className="min-h-36"
            defaultValue={defaults?.prompt}
            id="prompt"
            maxLength={5000}
            name="prompt"
            required
          />
          <FieldError errors={state.errors?.prompt} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="type">Tipo</label>
            <select
              className={cn("h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30", state.errors?.type?.length && "border-destructive")}
              id="type"
              name="type"
              onChange={(event) => changeType(event.target.value as QuestionTypeValue)}
              value={type}
            >
              <option value="SINGLE_CHOICE">Escolha única</option>
              <option value="TRUE_FALSE">Verdadeiro ou falso</option>
            </select>
            <FieldError errors={state.errors?.type} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="difficulty">Dificuldade</label>
            <select
              className={cn("h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30", state.errors?.difficulty?.length && "border-destructive")}
              defaultValue={defaults?.difficulty ?? "MEDIUM"}
              id="difficulty"
              name="difficulty"
            >
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Média</option>
              <option value="HARD">Difícil</option>
            </select>
            <FieldError errors={state.errors?.difficulty} />
          </div>
        </div>
      </section>

      <section aria-labelledby="question-answers" className="space-y-4 border-t p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold" id="question-answers">Alternativas</h2>
            <p className="mt-1 text-xs text-muted-foreground">Marque exatamente uma resposta correta.</p>
          </div>
          {type === "SINGLE_CHOICE" ? (
            <Button
              disabled={answers.length >= 8}
              onClick={() => setAnswers((current) => [...current, { isCorrect: false, key: rowKey(), text: "" }])}
              type="button"
              variant="outline"
            >
              <Plus aria-hidden="true" /> Adicionar alternativa
            </Button>
          ) : null}
        </div>
        <div className="divide-y overflow-hidden rounded-md border">
          {answers.map((answer, index) => (
            <div className="grid gap-3 p-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center" key={answer.key}>
              <label className="flex size-8 items-center justify-center" title="Definir como correta">
                <input
                  aria-label={`Alternativa ${index + 1} correta`}
                  checked={answer.isCorrect}
                  className="size-4 accent-foreground"
                  name="correct-answer-control"
                  onChange={() => setCorrect(answer.key)}
                  type="radio"
                />
              </label>
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">{String.fromCharCode(65 + index)}</span>
                <Input
                  aria-label={`Texto da alternativa ${index + 1}`}
                  maxLength={2000}
                  onChange={(event) => updateAnswer(answer.key, event.target.value)}
                  required
                  value={answer.text}
                />
              </div>
              <div className="flex justify-end gap-1">
                <Button aria-label="Mover alternativa para cima" disabled={index === 0} onClick={() => moveAnswer(index, -1)} size="icon" title="Mover para cima" type="button" variant="ghost">
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button aria-label="Mover alternativa para baixo" disabled={index === answers.length - 1} onClick={() => moveAnswer(index, 1)} size="icon" title="Mover para baixo" type="button" variant="ghost">
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button aria-label="Remover alternativa" disabled={answers.length <= 2 || type === "TRUE_FALSE"} onClick={() => removeAnswer(answer.key)} size="icon" title="Remover alternativa" type="button" variant="ghost">
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <FieldError errors={state.errors?.answers} />
      </section>

      <section aria-labelledby="question-explanation" className="space-y-3 border-t p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold" id="question-explanation">Explicação</h2>
          <p className="mt-1 text-xs text-muted-foreground">Obrigatória para publicar a questão.</p>
        </div>
        <Textarea
          aria-invalid={state.errors?.explanation?.length ? true : undefined}
          defaultValue={defaults?.explanation ?? ""}
          id="explanation"
          maxLength={10000}
          name="explanation"
        />
        <FieldError errors={state.errors?.explanation} />
      </section>

      <section aria-labelledby="question-publication" className="space-y-4 border-t p-5 sm:p-6">
        <h2 className="text-sm font-semibold" id="question-publication">Publicação</h2>
        <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="order">Posição</label>
            <Input defaultValue={defaults?.order ?? maximumOrder} id="order" max={maximumOrder} min={1} name="order" required type="number" />
            <FieldError errors={state.errors?.order} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <div className="flex h-10 items-center"><ContentStatusBadge status={defaults?.status ?? "DRAFT"} /></div>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 p-5 sm:flex-row sm:justify-end sm:p-6">
        <Link className={buttonVariants({ variant: "outline" })} href={cancelHref}>Cancelar</Link>
        <Button disabled={pending} type="submit">
          {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

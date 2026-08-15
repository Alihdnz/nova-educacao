"use client";

import { ListPlus, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { QuestionDifficultyBadge, QuestionTypeBadge } from "@/components/admin/question-badges";
import { Button } from "@/components/ui/button";
import type {
  QuestionDifficultyValue,
  QuestionTypeValue,
} from "@/lib/question-validation";

type AvailableQuestion = {
  difficulty: QuestionDifficultyValue;
  id: string;
  prompt: string;
  status: "ARCHIVED" | "DRAFT" | "PUBLISHED";
  type: QuestionTypeValue;
};

function AddButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending || count === 0} type="submit">
      {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <ListPlus aria-hidden="true" />}
      {pending ? "Adicionando..." : `Adicionar selecionadas (${count})`}
    </Button>
  );
}

export function AssessmentQuestionSelector({
  action,
  questions,
}: {
  action: (formData: FormData) => Promise<void>;
  questions: AvailableQuestion[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <form action={action} className="space-y-4">
      <div className="divide-y overflow-hidden rounded-md border">
        {questions.map((question) => {
          const checked = selected.includes(question.id);
          return (
            <label className="flex cursor-pointer items-start gap-3 p-3 hover:bg-muted/30" key={question.id}>
              <input
                checked={checked}
                className="mt-1 size-4 shrink-0 accent-foreground"
                name="questionIds"
                onChange={(event) => {
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, question.id]
                      : current.filter((id) => id !== question.id),
                  );
                }}
                type="checkbox"
                value={question.id}
              />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium leading-6">{question.prompt}</span>
                <span className="mt-2 flex flex-wrap gap-2">
                  <QuestionTypeBadge type={question.type} />
                  <QuestionDifficultyBadge difficulty={question.difficulty} />
                  <span className="inline-flex h-6 items-center rounded-full border px-2 text-xs text-muted-foreground">
                    {question.status === "PUBLISHED" ? "Publicada" : question.status === "DRAFT" ? "Rascunho" : "Arquivada"}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <div className="flex justify-end"><AddButton count={selected.length} /></div>
    </form>
  );
}

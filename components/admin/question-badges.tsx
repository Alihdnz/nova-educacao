import type { QuestionDifficultyValue, QuestionTypeValue } from "@/lib/question-validation";
import { cn } from "@/lib/utils";

const difficultyConfig = {
  EASY: { className: "border-emerald-200 bg-emerald-50 text-emerald-800", label: "Fácil" },
  HARD: { className: "border-rose-200 bg-rose-50 text-rose-800", label: "Difícil" },
  MEDIUM: { className: "border-amber-200 bg-amber-50 text-amber-800", label: "Média" },
} as const;

const typeLabels = {
  SINGLE_CHOICE: "Escolha única",
  TRUE_FALSE: "Verdadeiro ou falso",
} as const;

export function QuestionDifficultyBadge({ difficulty }: { difficulty: QuestionDifficultyValue }) {
  const config = difficultyConfig[difficulty];
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

export function QuestionTypeBadge({ type }: { type: QuestionTypeValue }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-sky-200 bg-sky-50 px-2 text-xs font-medium text-sky-800">
      {typeLabels[type]}
    </span>
  );
}

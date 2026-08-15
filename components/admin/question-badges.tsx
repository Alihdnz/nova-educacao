import type { QuestionDifficultyValue, QuestionTypeValue } from "@/lib/question-validation";
import { cn } from "@/lib/utils";

const difficultyConfig = {
  EASY: { className: "border-accent/25 bg-accent/10 text-[var(--nova-success)]", label: "Fácil" },
  HARD: { className: "border-rose-200 bg-rose-50 text-rose-800", label: "Difícil" },
  MEDIUM: { className: "border-[var(--nova-warning)]/20 bg-[color-mix(in_srgb,var(--nova-warning)_10%,transparent)] text-[var(--nova-warning)]", label: "Média" },
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
    <span className="inline-flex h-6 items-center rounded-full border border-primary/20 bg-primary/8 px-2 text-xs font-medium text-primary">
      {typeLabels[type]}
    </span>
  );
}

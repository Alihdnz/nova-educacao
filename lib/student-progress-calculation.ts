export type CompletionStats = {
  completed: number;
  isCompleted: boolean;
  percentage: number;
  total: number;
};

export function roundPercentage(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function ratioPercentage(part: number, total: number) {
  return total === 0 ? 0 : roundPercentage((part / total) * 100);
}

export function completionStats(completed: number, total: number): CompletionStats {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(safeTotal, Math.max(0, completed));

  return {
    completed: safeCompleted,
    isCompleted: safeTotal > 0 && safeCompleted === safeTotal,
    percentage: ratioPercentage(safeCompleted, safeTotal),
    total: safeTotal,
  };
}

export function averagePercentage(values: number[]) {
  return values.length === 0
    ? null
    : roundPercentage(
        values.reduce((total, value) => total + value, 0) / values.length,
      );
}

export function answerStats(answers: { isCorrect: boolean | null }[]) {
  const answered = answers.length;
  const correct = answers.filter((answer) => answer.isCorrect === true).length;
  const incorrect = answered - correct;

  return {
    accuracy: ratioPercentage(correct, answered),
    answered,
    correct,
    incorrect,
  };
}

export function formatPercentage(value: number | null) {
  return value === null
    ? "Indisponível"
    : `${new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(value)}%`;
}

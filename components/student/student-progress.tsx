import { ProgressStatus } from "@/lib/generated/prisma/client";
import { formatPercentage } from "@/lib/student-progress-calculation";
import { cn } from "@/lib/utils";

const statusConfig = {
  [ProgressStatus.NOT_STARTED]: {
    className: "border-border bg-muted text-muted-foreground",
    label: "Não iniciada",
  },
  [ProgressStatus.IN_PROGRESS]: {
    className: "border-primary/15 bg-primary/8 text-primary",
    label: "Em andamento",
  },
  [ProgressStatus.COMPLETED]: {
    className: "border-accent/25 bg-accent/12 text-[var(--nova-success)]",
    label: "Concluída",
  },
} as const;

export function LessonProgressBadge({ status }: { status: ProgressStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function StudentProgressBar({
  completed,
  percentage,
  total,
}: {
  completed: number;
  percentage: number;
  total: number;
}) {
  const value = Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">
          {total === 0 ? "Nenhuma aula disponível" : `${completed} de ${total} aula(s)`}
        </span>
        <span className="font-semibold tabular-nums">
          {formatPercentage(value)}
        </span>
      </div>
      <div
        aria-label={`Progresso: ${value}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

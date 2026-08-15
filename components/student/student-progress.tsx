import { ProgressStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const statusConfig = {
  [ProgressStatus.NOT_STARTED]: {
    className: "border-zinc-200 bg-zinc-50 text-zinc-700",
    label: "Não iniciada",
  },
  [ProgressStatus.IN_PROGRESS]: {
    className: "border-sky-200 bg-sky-50 text-sky-800",
    label: "Em andamento",
  },
  [ProgressStatus.COMPLETED]: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
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
        <span className="font-semibold tabular-nums">{value}%</span>
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
          className="h-full rounded-full bg-emerald-600 transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

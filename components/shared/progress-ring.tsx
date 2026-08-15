import { formatPercentage } from "@/lib/student-progress-calculation";
import { cn } from "@/lib/utils";

export function ProgressRing({
  className,
  label = "progresso",
  percentage,
}: {
  className?: string;
  label?: string;
  percentage: number;
}) {
  const value = Math.min(100, Math.max(0, percentage));

  return (
    <div
      aria-label={`${label}: ${formatPercentage(value)}`}
      className={cn(
        "relative grid size-28 shrink-0 place-items-center rounded-full sm:size-32",
        className,
      )}
      role="img"
      style={{
        background: `conic-gradient(var(--nova-accent) 0 ${value / 2}%, var(--primary) ${value / 2}% ${value}%, var(--muted) ${value}% 100%)`,
      }}
    >
      <div className="grid size-[calc(100%-0.75rem)] place-items-center rounded-full bg-card text-center">
        <span>
          <strong className="block font-heading text-2xl tabular-nums">
            {formatPercentage(value)}
          </strong>
          <span className="mt-0.5 block text-xs text-muted-foreground">{label}</span>
        </span>
      </div>
    </div>
  );
}

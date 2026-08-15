import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  accent = "primary",
  detail,
  icon: Icon,
  label,
  value,
}: {
  accent?: "accent" | "info" | "primary" | "success" | "warning";
  detail?: ReactNode;
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  const accents = {
    accent: "bg-accent/12 text-[var(--nova-success)]",
    info: "bg-[color-mix(in_srgb,var(--nova-info)_12%,transparent)] text-[var(--nova-info)]",
    primary: "bg-primary/10 text-primary",
    success: "bg-[color-mix(in_srgb,var(--nova-success)_12%,transparent)] text-[var(--nova-success)]",
    warning: "bg-[color-mix(in_srgb,var(--nova-warning)_13%,transparent)] text-[var(--nova-warning)]",
  };

  return (
    <Card className="flex min-h-36 flex-col items-start gap-3 p-4 sm:min-h-32 sm:flex-row sm:gap-4 sm:p-5">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg sm:size-11", accents[accent])}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        <p className="mt-1 font-heading text-xl font-semibold tabular-nums sm:text-2xl">{value}</p>
        {detail ? <div className="mt-2 text-xs font-medium text-primary">{detail}</div> : null}
      </div>
    </Card>
  );
}

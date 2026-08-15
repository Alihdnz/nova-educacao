import type { StructureStatus } from "@/lib/course-structure-validation";
import { cn } from "@/lib/utils";

const statusConfig = {
  ARCHIVED: { label: "Arquivado", className: "border-border bg-muted text-muted-foreground" },
  DRAFT: { label: "Rascunho", className: "border-[var(--nova-warning)]/20 bg-[color-mix(in_srgb,var(--nova-warning)_10%,transparent)] text-[var(--nova-warning)]" },
  PUBLISHED: {
    label: "Publicado",
    className: "border-accent/25 bg-accent/12 text-[var(--nova-success)]",
  },
} as const;

export function ContentStatusBadge({ status }: { status: StructureStatus }) {
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

import type { StructureStatus } from "@/lib/course-structure-validation";
import { cn } from "@/lib/utils";

const statusConfig = {
  ARCHIVED: { label: "Arquivado", className: "border-zinc-300 bg-zinc-100 text-zinc-700" },
  DRAFT: { label: "Rascunho", className: "border-amber-200 bg-amber-50 text-amber-800" },
  PUBLISHED: {
    label: "Publicado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
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

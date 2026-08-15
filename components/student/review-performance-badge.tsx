import type { PerformanceClassification } from "@/lib/student-review";
import { cn } from "@/lib/utils";

const styles = {
  ATTENTION: "bg-amber-500/12 text-amber-700",
  EXCELLENT: "bg-emerald-500/12 text-emerald-700",
  GOOD: "bg-cyan-500/12 text-cyan-700",
  INSUFFICIENT: "bg-muted text-muted-foreground",
  REVIEW: "bg-red-500/12 text-red-700",
} as const;

export function ReviewPerformanceBadge({ classification }: { classification: PerformanceClassification }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", styles[classification.key])}>{classification.label}</span>;
}

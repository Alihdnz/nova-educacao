import { ArrowRight, CheckCircle2, FileCheck2, XCircle } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { StudentAssessmentProgress } from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";

export function AssessmentProgressList({
  assessments,
  emptyMessage = "Nenhuma avaliação realizada.",
  showCourse = false,
}: {
  assessments: StudentAssessmentProgress[];
  emptyMessage?: string;
  showCourse?: boolean;
}) {
  if (assessments.length === 0) {
    return (
      <p className="border-y py-5 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="nova-surface divide-y overflow-hidden">
      {assessments.map((assessment) => {
        const latest = assessment.latestAttempt;
        const best = assessment.bestAttempt;

        return (
          <article
            className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:p-5"
            key={`${assessment.courseId}-${assessment.assessmentId}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileCheck2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                <h3 className="truncate font-semibold">{assessment.title}</h3>
              </div>
              {showCourse ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {assessment.courseTitle}
                </p>
              ) : null}
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tentativas</p>
                  <p className="mt-1 font-semibold tabular-nums">
                    {assessment.attemptCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Última nota</p>
                  <p className="mt-1 font-semibold tabular-nums">
                    {latest.score !== null && latest.maxScore !== null
                      ? `${latest.score} de ${latest.maxScore}`
                      : "Indisponível"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Último resultado</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-semibold tabular-nums">
                    {latest.passed === true ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-4 text-[var(--nova-success)]"
                      />
                    ) : latest.passed === false ? (
                      <XCircle
                        aria-hidden="true"
                        className="size-4 text-destructive"
                      />
                    ) : null}
                    {formatPercentage(latest.percentage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Melhor resultado</p>
                  <p className="mt-1 font-semibold tabular-nums">
                    {formatPercentage(best?.percentage ?? null)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Última realização: {latest.submittedAt?.toLocaleString("pt-BR") ?? "data indisponível"}
              </p>
            </div>
            {assessment.href ? (
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={assessment.href}
              >
                Ver histórico
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

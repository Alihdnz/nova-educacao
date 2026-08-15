import { ArrowRight, BookMarked, FileQuestion } from "lucide-react";
import Link from "next/link";

import { ReviewPerformanceBadge } from "@/components/student/review-performance-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { getStudentReview } from "@/lib/student-review";

type Recommendation = Awaited<ReturnType<typeof getStudentReview>>["recommendations"][number];

export function ReviewRecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><BookMarked aria-hidden="true" className="size-5" /></span>
          {recommendation.performance ? <ReviewPerformanceBadge classification={recommendation.performance.classification} /> : null}
        </div>
        <div>
          <p className="text-xs font-semibold text-primary">{recommendation.subjectTitle}</p>
          <h3 className="mt-1 text-base font-semibold">{recommendation.assessmentTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{recommendation.moduleTitle} · {recommendation.lessonTitle}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <p className="text-sm leading-6 text-muted-foreground">{recommendation.reason}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><FileQuestion aria-hidden="true" className="size-3.5" />{recommendation.questionCount} questão(ões)</span>
          {recommendation.performance ? <span>Desempenho anterior: {recommendation.performance.accuracy.toFixed(0)}%</span> : <span>Sem resultado anterior</span>}
        </div>
        <Link className={`${buttonVariants()} mt-5 w-full`} href={recommendation.href}>Iniciar revisão<ArrowRight aria-hidden="true" /></Link>
      </CardContent>
    </Card>
  );
}

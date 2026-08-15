import { BookMarked, CheckCircle2, CircleAlert, FileQuestion, Target } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { ReviewPerformanceBadge } from "@/components/student/review-performance-badge";
import { ReviewRecommendationCard } from "@/components/student/review-recommendation-card";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { getStudentReview, type ReviewMetric } from "@/lib/student-review";

export const metadata: Metadata = { title: "Revisão personalizada" };

function MetricList({ empty, metrics, title }: { empty: string; metrics: ReviewMetric[]; title: string }) {
  return (
    <section aria-labelledby={`${title}-title`} className="nova-surface overflow-hidden">
      <div className="border-b px-5 py-4"><h2 className="font-semibold" id={`${title}-title`}>{title}</h2></div>
      {metrics.length === 0 ? <p className="px-5 py-7 text-sm text-muted-foreground">{empty}</p> : (
        <div className="divide-y">
          {metrics.slice(0, 5).map((metric) => (
            <article className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={metric.id}>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{metric.label}</p><p className="mt-1 text-xs text-muted-foreground">{metric.correct} acerto(s), {metric.errors} erro(s), {metric.responses} resposta(s)</p></div>
              <div className="flex items-center gap-3"><strong className="text-sm">{metric.accuracy.toFixed(0)}%</strong><ReviewPerformanceBadge classification={metric.classification} /></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function StudentReviewPage() {
  const session = await requireRole(UserRole.STUDENT);
  const review = await getStudentReview(session.user.id);

  return (
    <Container className="max-w-[96rem] space-y-7 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Início" }, { label: "Revisão" }]} />
      <header><p className="text-sm font-semibold text-primary">Plano de estudo orientado por dados</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Revisão personalizada</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">As recomendações usam apenas suas respostas em avaliações concluídas e os conteúdos publicados dos cursos em que você está matriculado.</p></header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo de desempenho">
        <StatCard icon={FileQuestion} label="Respostas" value={review.overall.responses} />
        <StatCard icon={CheckCircle2} label="Acertos" value={review.overall.correct} />
        <StatCard icon={CircleAlert} label="Erros" value={review.overall.errors} />
        <StatCard icon={Target} label="Aproveitamento" value={`${review.overall.accuracy.toFixed(0)}%`} />
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-5 py-4"><span className="text-sm font-semibold">Classificação geral</span><ReviewPerformanceBadge classification={review.overall.classification} /><span className="text-xs text-muted-foreground">A classificação começa após 3 respostas.</span></div>

      <section className="space-y-4" aria-labelledby="recommendations-title">
        <div><h2 className="text-xl font-semibold" id="recommendations-title">Recomendações para você</h2><p className="mt-1 text-sm text-muted-foreground">Priorizadas por menor aproveitamento, erros recentes, dificuldade relacionada e conteúdos incompletos.</p></div>
        {review.recommendations.length === 0 ? <Card><EmptyState description="Quando houver avaliações publicadas em seus cursos, elas aparecerão aqui." icon={BookMarked} title="Nenhuma revisão disponível" /></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{review.recommendations.map((recommendation) => <ReviewRecommendationCard key={`${recommendation.enrollmentId}-${recommendation.assessmentId}`} recommendation={recommendation} />)}</div>}
      </section>

      <section className="space-y-4" aria-labelledby="analysis-title">
        <div><h2 className="text-xl font-semibold" id="analysis-title">Onde concentrar seus estudos</h2><p className="mt-1 text-sm text-muted-foreground">Erros são derivados de respostas marcadas como incorretas em tentativas finalizadas.</p></div>
        <div className="grid gap-4 xl:grid-cols-2"><MetricList empty="Ainda não há respostas suficientes por disciplina." metrics={review.subjects} title="Por disciplina" /><MetricList empty="Ainda não há respostas suficientes por módulo." metrics={review.modules} title="Por módulo" /><MetricList empty="Ainda não há respostas suficientes por aula." metrics={review.lessons} title="Por aula" /><MetricList empty="Ainda não há respostas suficientes por dificuldade." metrics={review.difficulties} title="Por dificuldade" /></div>
      </section>

      <MetricList empty="As questões respondidas aparecerão depois da primeira avaliação concluída." metrics={review.questions} title="Desempenho por questão" />
    </Container>
  );
}

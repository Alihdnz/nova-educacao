import { ArrowLeft, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addAssessmentQuestionsAction,
  moveAssessmentQuestionAction,
  removeAssessmentQuestionAction,
  setAssessmentStatusAction,
  updateAssessmentQuestionWeightAction,
} from "@/app/admin/courses/assessment-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminFeedback } from "@/components/admin/admin-feedback";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentQuestionSelector } from "@/components/admin/assessment-question-selector";
import { AssessmentWeightForm } from "@/components/admin/assessment-weight-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { ContentStatusActions } from "@/components/admin/content-status-actions";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { QuestionDifficultyBadge, QuestionTypeBadge } from "@/components/admin/question-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ContentStatus, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Gerenciar avaliação" };

type PageProps = {
  params: Promise<{ assessmentId: string; courseId: string; lessonId: string; moduleId: string; subjectId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AssessmentDetailPage({ params, searchParams }: PageProps) {
  const [{ assessmentId, courseId, lessonId, moduleId, subjectId }, { error, success }] = await Promise.all([params, searchParams]);
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, lessonId, lesson: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } } },
    select: {
      description: true,
      lesson: {
        select: {
          module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } },
          questions: { where: { status: { not: ContentStatus.ARCHIVED } }, orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { difficulty: true, id: true, prompt: true, status: true, type: true } },
          title: true,
        },
      },
      maxScore: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          order: true,
          question: { select: { difficulty: true, id: true, prompt: true, status: true, type: true } },
          weight: true,
        },
      },
      slug: true,
      status: true,
      timeLimitMinutes: true,
      title: true,
      updatedAt: true,
    },
  });
  if (!assessment || !assessment.lesson) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const lessonsBase = `${modulesBase}/${moduleId}/lessons`;
  const base = `${lessonsBase}/${lessonId}/assessments`;
  const current = `${base}/${assessmentId}`;
  const selectedIds = new Set(assessment.questions.map((item) => item.question.id));
  const availableQuestions = assessment.lesson.questions.filter((question) => !selectedIds.has(question.id));
  const totalWeight = assessment.questions.reduce((total, item) => total.plus(item.weight), new Prisma.Decimal(0));
  const balanced = totalWeight.equals(assessment.maxScore);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/courses", label: "Cursos" },
        { href: `/admin/courses/${courseId}`, label: assessment.lesson.module.subject.course.title },
        { href: modulesBase, label: assessment.lesson.module.subject.title },
        { href: lessonsBase, label: assessment.lesson.module.title },
        { href: base, label: assessment.lesson.title },
        { label: assessment.title },
      ]} />
      <AdminPageHeader
        actions={<><Link className={buttonVariants({ variant: "outline" })} href={base}><ArrowLeft aria-hidden="true" />Voltar</Link><Link className={buttonVariants()} href={`${current}/edit`}><Pencil aria-hidden="true" />Editar configuração</Link></>}
        description={assessment.description || "Avaliação sem instruções adicionais."}
        eyebrow="Avaliação"
        title={assessment.title}
      />
      <AdminFeedback error={error} success={success} />

      <section aria-label="Resumo da avaliação" className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-background p-4"><p className="text-xs text-muted-foreground">Status</p><div className="mt-2"><ContentStatusBadge status={assessment.status} /></div></div>
        <div className="bg-background p-4"><p className="text-xs text-muted-foreground">Nota máxima</p><p className="mt-1 text-lg font-semibold tabular-nums">{assessment.maxScore.toString()}</p></div>
        <div className="bg-background p-4"><p className="text-xs text-muted-foreground">Soma dos pesos</p><p className={balanced ? "mt-1 text-lg font-semibold tabular-nums text-emerald-700" : "mt-1 text-lg font-semibold tabular-nums text-destructive"}>{totalWeight.toString()}</p></div>
        <div className="bg-background p-4"><p className="text-xs text-muted-foreground">Tempo</p><p className="mt-1 text-lg font-semibold tabular-nums">{assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} min` : "Sem limite"}</p></div>
      </section>

      <section className="space-y-4">
        <div><h2 className="text-lg font-semibold">Questões selecionadas</h2><p className="mt-1 text-sm text-muted-foreground">A ordem e o peso são específicos desta avaliação.</p></div>
        {assessment.questions.length === 0 ? (
          <div className="rounded-lg border bg-background"><EmptyState description="Nenhuma questão selecionada para esta avaliação." icon={Plus} title="Avaliação sem questões" /></div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border bg-background">
            {assessment.questions.map((item, index) => (
              <article className="space-y-4 p-4 sm:p-5" key={item.question.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold">{item.order}</span>
                    <div className="min-w-0"><p className="line-clamp-2 text-sm font-medium leading-6">{item.question.prompt}</p><div className="mt-2 flex flex-wrap gap-2"><ContentStatusBadge status={item.question.status} /><QuestionTypeBadge type={item.question.type} /><QuestionDifficultyBadge difficulty={item.question.difficulty} /></div></div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <AssessmentWeightForm action={updateAssessmentQuestionWeightAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, item.question.id)} defaultValue={item.weight.toString()} />
                    <OrderControls
                      downAction={moveAssessmentQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, item.question.id, "down")}
                      first={index === 0}
                      last={index === assessment.questions.length - 1}
                      upAction={moveAssessmentQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, item.question.id, "up")}
                    />
                  </div>
                </div>
                <ConfirmAction action={removeAssessmentQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, item.question.id)} description="A questão será removida somente desta avaliação. O cadastro original será preservado." kind="remove" title="Remover questão da avaliação?" />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div><h2 className="text-lg font-semibold">Adicionar questões</h2><p className="mt-1 text-sm text-muted-foreground">Somente questões vinculadas a esta aula são exibidas.</p></div>
        {availableQuestions.length === 0 ? (
          <div className="rounded-lg border bg-background"><EmptyState description="Todas as questões da aula já estão selecionadas ou ainda não há questões cadastradas." icon={Plus} title="Nenhuma questão disponível" /></div>
        ) : (
          <AssessmentQuestionSelector action={addAssessmentQuestionsAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId)} questions={availableQuestions} />
        )}
      </section>

      <ContentStatusActions
        archiveAction={setAssessmentStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, ContentStatus.ARCHIVED)}
        entityLabel="avaliação"
        entityTitle={assessment.title}
        publishAction={setAssessmentStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, ContentStatus.PUBLISHED)}
        status={assessment.status}
        unpublishAction={setAssessmentStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId, ContentStatus.DRAFT)}
      />
    </div>
  );
}

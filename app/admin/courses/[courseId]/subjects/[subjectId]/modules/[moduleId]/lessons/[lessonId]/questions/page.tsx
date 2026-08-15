import { Eye, HelpCircle, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { moveQuestionAction, setQuestionStatusAction } from "@/app/admin/courses/question-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminFeedback } from "@/components/admin/admin-feedback";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusActions } from "@/components/admin/content-status-actions";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { QuestionDifficultyBadge, QuestionTypeBadge } from "@/components/admin/question-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Questões" };

type PageProps = {
  params: Promise<{ courseId: string; lessonId: string; moduleId: string; subjectId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function QuestionsPage({ params, searchParams }: PageProps) {
  const [{ courseId, lessonId, moduleId, subjectId }, { error, success }] = await Promise.all([
    params,
    searchParams,
  ]);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } },
    select: {
      id: true,
      module: {
        select: {
          subject: { select: { course: { select: { title: true } }, title: true } },
          title: true,
        },
      },
      questions: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          _count: { select: { answers: true, assessmentQuestions: true } },
          difficulty: true,
          id: true,
          order: true,
          prompt: true,
          status: true,
          type: true,
          updatedAt: true,
        },
      },
      title: true,
    },
  });
  if (!lesson) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const lessonsBase = `${modulesBase}/${moduleId}/lessons`;
  const base = `${lessonsBase}/${lessonId}/questions`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: lesson.module.subject.course.title },
          { href: modulesBase, label: lesson.module.subject.title },
          { href: lessonsBase, label: lesson.module.title },
          { label: lesson.title },
          { label: "Questões" },
        ]}
      />
      <AdminPageHeader
        actions={<Link className={buttonVariants()} href={`${base}/new`}><Plus aria-hidden="true" />Nova questão</Link>}
        description={`Gerencie exercícios e alternativas vinculados à aula ${lesson.title}.`}
        eyebrow={lesson.module.title}
        title="Questões"
      />
      <AdminFeedback error={error} success={success} />

      {lesson.questions.length === 0 ? (
        <section className="rounded-lg border bg-background">
          <EmptyState
            action={<Link className={buttonVariants()} href={`${base}/new`}><Plus aria-hidden="true" />Criar primeira questão</Link>}
            description="Nenhuma questão cadastrada nesta aula."
            icon={HelpCircle}
            title="Aula sem questões"
          />
        </section>
      ) : (
        <section aria-label="Lista de questões" className="divide-y overflow-hidden rounded-lg border bg-background">
          {lesson.questions.map((question, index) => (
            <article className="space-y-4 p-4 sm:p-5" key={question.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
                    {question.order ?? index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-medium leading-6">{question.prompt}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <ContentStatusBadge status={question.status} />
                      <QuestionTypeBadge type={question.type} />
                      <QuestionDifficultyBadge difficulty={question.difficulty} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{question._count.answers} alternativa(s)</span>
                      <span>{question._count.assessmentQuestions} avaliação(ões)</span>
                      <span>Atualizada em {question.updatedAt.toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <OrderControls
                    downAction={moveQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId, question.id, "down")}
                    first={index === 0}
                    last={index === lesson.questions.length - 1}
                    upAction={moveQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId, question.id, "up")}
                  />
                  <Link aria-label={`Visualizar questão ${index + 1}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={`${base}/${question.id}`} title="Visualizar questão"><Eye aria-hidden="true" /></Link>
                  <Link aria-label={`Editar questão ${index + 1}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={`${base}/${question.id}/edit`} title="Editar questão"><Pencil aria-hidden="true" /></Link>
                </div>
              </div>
              <ContentStatusActions
                archiveAction={setQuestionStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, question.id, ContentStatus.ARCHIVED)}
                entityLabel="questão"
                entityTitle={question.prompt}
                publishAction={setQuestionStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, question.id, ContentStatus.PUBLISHED)}
                status={question.status}
                unpublishAction={setQuestionStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, question.id, ContentStatus.DRAFT)}
              />
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

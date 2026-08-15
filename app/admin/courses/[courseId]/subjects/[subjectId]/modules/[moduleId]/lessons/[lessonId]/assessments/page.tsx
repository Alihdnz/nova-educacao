import { ClipboardCheck, Eye, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { setAssessmentStatusAction } from "@/app/admin/courses/assessment-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminFeedback } from "@/components/admin/admin-feedback";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusActions } from "@/components/admin/content-status-actions";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Avaliações" };

type PageProps = {
  params: Promise<{ courseId: string; lessonId: string; moduleId: string; subjectId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AssessmentsPage({ params, searchParams }: PageProps) {
  const [{ courseId, lessonId, moduleId, subjectId }, { error, success }] = await Promise.all([params, searchParams]);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } },
    select: {
      assessments: {
        orderBy: { updatedAt: "desc" },
        select: { _count: { select: { questions: true } }, description: true, id: true, maxScore: true, slug: true, status: true, timeLimitMinutes: true, title: true, updatedAt: true },
      },
      module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } },
      title: true,
    },
  });
  if (!lesson) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const lessonsBase = `${modulesBase}/${moduleId}/lessons`;
  const base = `${lessonsBase}/${lessonId}/assessments`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/courses", label: "Cursos" },
        { href: `/admin/courses/${courseId}`, label: lesson.module.subject.course.title },
        { href: modulesBase, label: lesson.module.subject.title },
        { href: lessonsBase, label: lesson.module.title },
        { label: lesson.title },
        { label: "Avaliações" },
      ]} />
      <AdminPageHeader actions={<Link className={buttonVariants()} href={`${base}/new`}><Plus aria-hidden="true" />Nova avaliação</Link>} description={`Configure avaliações e selecione questões da aula ${lesson.title}.`} eyebrow={lesson.module.title} title="Avaliações" />
      <AdminFeedback error={error} success={success} />

      {lesson.assessments.length === 0 ? (
        <section className="rounded-lg border bg-background">
          <EmptyState action={<Link className={buttonVariants()} href={`${base}/new`}><Plus aria-hidden="true" />Criar primeira avaliação</Link>} description="Nenhuma avaliação cadastrada nesta aula." icon={ClipboardCheck} title="Aula sem avaliações" />
        </section>
      ) : (
        <section aria-label="Lista de avaliações" className="divide-y overflow-hidden rounded-lg border bg-background">
          {lesson.assessments.map((assessment) => (
            <article className="space-y-4 p-4 sm:p-5" key={assessment.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{assessment.title}</h2><ContentStatusBadge status={assessment.status} /></div>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{assessment.slug}</p>
                  {assessment.description ? <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{assessment.description}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{assessment._count.questions} questão(ões)</span>
                    <span>Nota {assessment.maxScore.toString()}</span>
                    <span>{assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} min` : "Sem limite de tempo"}</span>
                    <span>Atualizada em {assessment.updatedAt.toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Link aria-label={`Gerenciar ${assessment.title}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={`${base}/${assessment.id}`} title="Gerenciar avaliação"><Eye aria-hidden="true" /></Link>
                  <Link aria-label={`Editar ${assessment.title}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={`${base}/${assessment.id}/edit`} title="Editar avaliação"><Pencil aria-hidden="true" /></Link>
                </div>
              </div>
              <ContentStatusActions
                archiveAction={setAssessmentStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, assessment.id, ContentStatus.ARCHIVED)}
                entityLabel="avaliação"
                entityTitle={assessment.title}
                publishAction={setAssessmentStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, assessment.id, ContentStatus.PUBLISHED)}
                status={assessment.status}
                unpublishAction={setAssessmentStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, assessment.id, ContentStatus.DRAFT)}
              />
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

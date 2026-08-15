import { Eye, FileCheck2, FileText, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { moveLessonAction, setLessonStatusAction } from "@/app/admin/courses/lesson-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminFeedback } from "@/components/admin/admin-feedback";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusActions } from "@/components/admin/content-status-actions";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { safeHttpUrl } from "@/lib/content-security";
import { ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Aulas" };

type LessonsPageProps = {
  params: Promise<{ courseId: string; moduleId: string; subjectId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function LessonsPage({ params, searchParams }: LessonsPageProps) {
  const [{ courseId, moduleId, subjectId }, { error, success }] = await Promise.all([
    params,
    searchParams,
  ]);
  const courseModule = await prisma.module.findFirst({
    where: { id: moduleId, subjectId, subject: { courseId } },
    select: {
      id: true,
      lessons: {
        orderBy: { order: "asc" },
        select: {
          content: true,
          description: true,
          id: true,
          imageUrl: true,
          order: true,
          slug: true,
          status: true,
          title: true,
          updatedAt: true,
        },
      },
      subject: {
        select: {
          course: { select: { id: true, title: true } },
          id: true,
          title: true,
        },
      },
      title: true,
    },
  });
  if (!courseModule) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const base = `${modulesBase}/${courseModule.id}/lessons`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: courseModule.subject.course.title },
          { href: modulesBase, label: courseModule.subject.title },
          { label: courseModule.title },
          { label: "Aulas" },
        ]}
      />
      <AdminPageHeader
        actions={
          <>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={`${modulesBase}/${courseModule.id}/edit`}
            >
              <Pencil aria-hidden="true" />
              Editar módulo
            </Link>
            <Link className={buttonVariants()} href={`${base}/new`}>
              <Plus aria-hidden="true" />
              Nova aula
            </Link>
          </>
        }
        description={`Gerencie o conteúdo e a publicação das aulas do módulo ${courseModule.title}.`}
        eyebrow={courseModule.subject.title}
        title="Aulas"
      />
      <AdminFeedback error={error} success={success} />

      {courseModule.lessons.length === 0 ? (
        <section className="rounded-lg border bg-background">
          <EmptyState
            action={
              <Link className={buttonVariants()} href={`${base}/new`}>
                <Plus aria-hidden="true" />
                Criar primeira aula
              </Link>
            }
            description="Nenhuma aula cadastrada neste módulo."
            icon={FileText}
            title="Módulo sem aulas"
          />
        </section>
      ) : (
        <section
          aria-label="Lista de aulas"
          className="divide-y overflow-hidden rounded-lg border bg-background"
        >
          {courseModule.lessons.map((lesson, index) => {
            const imageUrl = lesson.imageUrl ? safeHttpUrl(lesson.imageUrl) : null;
            const previewHref = `${base}/${lesson.id}/preview`;

            return (
              <article className="space-y-4 p-4 sm:p-5" key={lesson.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
                      {lesson.order}
                    </span>
                    {imageUrl ? (
                      <div className="hidden aspect-video w-28 shrink-0 overflow-hidden rounded-md border bg-muted sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="size-full object-cover" loading="lazy" src={imageUrl} />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{lesson.title}</h2>
                        <ContentStatusBadge status={lesson.status} />
                      </div>
                      <p className="mt-1 break-all text-sm text-muted-foreground">{lesson.slug}</p>
                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {lesson.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {lesson.content?.trim() ? (
                            <FileCheck2 aria-hidden="true" className="size-3.5 text-emerald-700" />
                          ) : (
                            <FileText aria-hidden="true" className="size-3.5" />
                          )}
                          {lesson.content?.trim() ? "Com conteúdo" : "Sem conteúdo"}
                        </span>
                        <span>Atualizada em {lesson.updatedAt.toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <OrderControls
                      downAction={moveLessonAction.bind(
                        null,
                        courseId,
                        subjectId,
                        courseModule.id,
                        lesson.id,
                        "down",
                      )}
                      first={index === 0}
                      last={index === courseModule.lessons.length - 1}
                      upAction={moveLessonAction.bind(
                        null,
                        courseId,
                        subjectId,
                        courseModule.id,
                        lesson.id,
                        "up",
                      )}
                    />
                    <Link
                      aria-label={`Preview de ${lesson.title}`}
                      className={buttonVariants({ size: "icon", variant: "ghost" })}
                      href={previewHref}
                      title="Visualizar preview"
                    >
                      <Eye aria-hidden="true" />
                    </Link>
                    <Link
                      aria-label={`Editar ${lesson.title}`}
                      className={buttonVariants({ size: "icon", variant: "ghost" })}
                      href={`${base}/${lesson.id}/edit`}
                      title="Editar aula"
                    >
                      <Pencil aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <ContentStatusActions
                  archiveAction={setLessonStatusAction.bind(
                    null,
                    courseId,
                    subjectId,
                    courseModule.id,
                    lesson.id,
                    ContentStatus.ARCHIVED,
                  )}
                  entityLabel="aula"
                  entityTitle={lesson.title}
                  publishAction={setLessonStatusAction.bind(
                    null,
                    courseId,
                    subjectId,
                    courseModule.id,
                    lesson.id,
                    ContentStatus.PUBLISHED,
                  )}
                  status={lesson.status}
                  unpublishAction={setLessonStatusAction.bind(
                    null,
                    courseId,
                    subjectId,
                    courseModule.id,
                    lesson.id,
                    ContentStatus.DRAFT,
                  )}
                />
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}


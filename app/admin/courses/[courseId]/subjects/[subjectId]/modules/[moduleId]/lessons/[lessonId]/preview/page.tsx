import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { LessonContentRenderer } from "@/components/content/lesson-content-renderer";
import { buttonVariants } from "@/components/ui/button";
import { safeHttpUrl } from "@/lib/content-security";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Preview da aula" };

export default async function LessonPreviewPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string; moduleId: string; subjectId: string }>;
}) {
  const { courseId, lessonId, moduleId, subjectId } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      moduleId,
      module: { subjectId, subject: { courseId } },
    },
    select: {
      content: true,
      createdAt: true,
      description: true,
      id: true,
      imageUrl: true,
      module: {
        select: {
          subject: {
            select: { course: { select: { title: true } }, title: true },
          },
          title: true,
        },
      },
      order: true,
      slug: true,
      status: true,
      title: true,
      updatedAt: true,
    },
  });
  if (!lesson) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const base = `${modulesBase}/${moduleId}/lessons`;
  const imageUrl = lesson.imageUrl ? safeHttpUrl(lesson.imageUrl) : null;

  return (
    <div className="space-y-7">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: lesson.module.subject.course.title },
          { href: modulesBase, label: lesson.module.subject.title },
          { href: base, label: lesson.module.title },
          { label: lesson.title },
          { label: "Preview" },
        ]}
      />
      <AdminPageHeader
        actions={
          <>
            <Link className={buttonVariants({ variant: "outline" })} href={base}>
              <ArrowLeft aria-hidden="true" />
              Voltar às aulas
            </Link>
            <Link className={buttonVariants()} href={`${base}/${lesson.id}/edit`}>
              <Pencil aria-hidden="true" />
              Editar aula
            </Link>
          </>
        }
        description="Visualização administrativa do conteúdo salvo."
        eyebrow="Preview administrativo"
        title={lesson.title}
      />

      <article className="mx-auto w-full max-w-4xl">
        <header className="border-b pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <ContentStatusBadge status={lesson.status} />
            <span className="text-xs text-muted-foreground">Aula {lesson.order}</span>
            <span className="text-xs text-muted-foreground">{lesson.slug}</span>
          </div>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{lesson.description}</p>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <dt>Criada:</dt>
              <dd>{lesson.createdAt.toLocaleDateString("pt-BR")}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Atualizada:</dt>
              <dd>{lesson.updatedAt.toLocaleString("pt-BR")}</dd>
            </div>
          </dl>
        </header>

        {imageUrl ? (
          <div className="mt-7 aspect-[16/7] overflow-hidden rounded-md border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Imagem principal de ${lesson.title}`}
              className="size-full object-cover"
              src={imageUrl}
            />
          </div>
        ) : null}

        <div className="py-4 sm:py-7">
          {lesson.content?.trim() ? (
            <LessonContentRenderer content={lesson.content} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Aula sem conteúdo salvo.</p>
          )}
        </div>
      </article>
    </div>
  );
}


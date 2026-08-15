import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateLessonAction } from "@/app/admin/courses/lesson-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LessonForm } from "@/components/admin/lesson-form";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar aula" };

export default async function EditLessonPage({
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
      description: true,
      id: true,
      imageUrl: true,
      module: {
        select: {
          id: true,
          subject: {
            select: { course: { select: { title: true } }, id: true, title: true },
          },
          title: true,
        },
      },
      order: true,
      slug: true,
      status: true,
      title: true,
    },
  });
  if (!lesson) notFound();
  const count = await prisma.lesson.count({
    where: { moduleId, module: { subjectId, subject: { courseId } } },
  });

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const base = `${modulesBase}/${moduleId}/lessons`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: lesson.module.subject.course.title },
          { href: modulesBase, label: lesson.module.subject.title },
          { href: base, label: lesson.module.title },
          { label: lesson.title },
          { label: "Editar" },
        ]}
      />
      <AdminPageHeader
        actions={
          <Link className={buttonVariants({ variant: "outline" })} href={`${base}/${lesson.id}/preview`}>
            <Eye aria-hidden="true" />
            Preview salvo
          </Link>
        }
        description="Atualize o resumo, o conteúdo, a imagem e os metadados da aula."
        eyebrow={lesson.module.title}
        title={`Editar ${lesson.title}`}
      />
      <LessonForm
        action={updateLessonAction.bind(null, courseId, subjectId, moduleId, lesson.id)}
        cancelHref={base}
        defaults={lesson}
        maximumOrder={count}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}


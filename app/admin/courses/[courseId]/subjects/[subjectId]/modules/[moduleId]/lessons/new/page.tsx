import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createLessonAction } from "@/app/admin/courses/lesson-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LessonForm } from "@/components/admin/lesson-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nova aula" };

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; subjectId: string }>;
}) {
  const { courseId, moduleId, subjectId } = await params;
  const courseModule = await prisma.module.findFirst({
    where: { id: moduleId, subjectId, subject: { courseId } },
    select: {
      _count: { select: { lessons: true } },
      id: true,
      subject: {
        select: { course: { select: { title: true } }, id: true, title: true },
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
          { href: base, label: courseModule.title },
          { label: "Nova aula" },
        ]}
      />
      <AdminPageHeader
        description={`A nova aula será vinculada ao módulo ${courseModule.title} e iniciará como rascunho.`}
        eyebrow="Aulas"
        title="Nova aula"
      />
      <LessonForm
        action={createLessonAction.bind(null, courseId, subjectId, courseModule.id)}
        cancelHref={base}
        maximumOrder={courseModule._count.lessons + 1}
        submitLabel="Criar aula"
      />
    </div>
  );
}


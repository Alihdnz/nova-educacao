import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createAssessmentAction } from "@/app/admin/courses/assessment-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentForm } from "@/components/admin/assessment-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nova avaliação" };

export default async function NewAssessmentPage({ params }: { params: Promise<{ courseId: string; lessonId: string; moduleId: string; subjectId: string }> }) {
  const { courseId, lessonId, moduleId, subjectId } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } },
    select: { module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } }, title: true },
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
        { href: base, label: lesson.title },
        { label: "Nova avaliação" },
      ]} />
      <AdminPageHeader description="Defina nota e tempo. A seleção de questões será feita após a criação." eyebrow="Avaliações" title="Nova avaliação" />
      <AssessmentForm action={createAssessmentAction.bind(null, courseId, subjectId, moduleId, lessonId)} cancelHref={base} submitLabel="Criar avaliação" />
    </div>
  );
}

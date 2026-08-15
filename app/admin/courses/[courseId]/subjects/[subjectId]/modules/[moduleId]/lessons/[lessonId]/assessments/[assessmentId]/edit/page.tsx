import { ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateAssessmentAction } from "@/app/admin/courses/assessment-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentForm } from "@/components/admin/assessment-form";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar avaliação" };

export default async function EditAssessmentPage({ params }: { params: Promise<{ assessmentId: string; courseId: string; lessonId: string; moduleId: string; subjectId: string }> }) {
  const { assessmentId, courseId, lessonId, moduleId, subjectId } = await params;
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, lessonId, lesson: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } } },
    select: { description: true, lesson: { select: { module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } }, title: true } }, maxScore: true, slug: true, status: true, timeLimitMinutes: true, title: true },
  });
  if (!assessment) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const lessonsBase = `${modulesBase}/${moduleId}/lessons`;
  const base = `${lessonsBase}/${lessonId}/assessments`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/courses", label: "Cursos" },
        { href: `/admin/courses/${courseId}`, label: assessment.lesson?.module.subject.course.title ?? "Curso" },
        { href: modulesBase, label: assessment.lesson?.module.subject.title ?? "Disciplina" },
        { href: lessonsBase, label: assessment.lesson?.module.title ?? "Módulo" },
        { href: base, label: assessment.lesson?.title ?? "Aula" },
        { label: "Editar avaliação" },
      ]} />
      <AdminPageHeader actions={<Link className={buttonVariants({ variant: "outline" })} href={`${base}/${assessmentId}`}><ListChecks aria-hidden="true" />Gerenciar questões</Link>} description="Atualize título, instruções, nota máxima e tempo limite." eyebrow="Avaliações" title={`Editar ${assessment.title}`} />
      <AssessmentForm action={updateAssessmentAction.bind(null, courseId, subjectId, moduleId, lessonId, assessmentId)} cancelHref={base} defaults={{ ...assessment, maxScore: assessment.maxScore.toString() }} submitLabel="Salvar alterações" />
    </div>
  );
}

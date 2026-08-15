import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createQuestionAction } from "@/app/admin/courses/question-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuestionForm } from "@/components/admin/question-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nova questão" };

export default async function NewQuestionPage({ params }: { params: Promise<{ courseId: string; lessonId: string; moduleId: string; subjectId: string }> }) {
  const { courseId, lessonId, moduleId, subjectId } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } },
    select: {
      _count: { select: { questions: true } },
      module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } },
      title: true,
    },
  });
  if (!lesson) notFound();

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const lessonsBase = `${modulesBase}/${moduleId}/lessons`;
  const base = `${lessonsBase}/${lessonId}/questions`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/courses", label: "Cursos" },
        { href: `/admin/courses/${courseId}`, label: lesson.module.subject.course.title },
        { href: modulesBase, label: lesson.module.subject.title },
        { href: lessonsBase, label: lesson.module.title },
        { href: base, label: lesson.title },
        { label: "Nova questão" },
      ]} />
      <AdminPageHeader description="Cadastre o enunciado, as alternativas e a resposta correta. A questão iniciará como rascunho." eyebrow="Questões" title="Nova questão" />
      <QuestionForm action={createQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId)} cancelHref={base} maximumOrder={lesson._count.questions + 1} submitLabel="Criar questão" />
    </div>
  );
}

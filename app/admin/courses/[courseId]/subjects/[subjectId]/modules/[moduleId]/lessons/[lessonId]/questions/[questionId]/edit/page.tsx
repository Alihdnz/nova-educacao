import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateQuestionAction } from "@/app/admin/courses/question-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuestionForm } from "@/components/admin/question-form";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar questão" };

export default async function EditQuestionPage({ params }: { params: Promise<{ courseId: string; lessonId: string; moduleId: string; questionId: string; subjectId: string }> }) {
  const { courseId, lessonId, moduleId, questionId, subjectId } = await params;
  const question = await prisma.question.findFirst({
    where: { id: questionId, lessonId, lesson: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } } },
    select: {
      answers: { orderBy: { order: "asc" }, select: { id: true, isCorrect: true, text: true } },
      difficulty: true,
      explanation: true,
      lesson: { select: { module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } }, title: true } },
      order: true,
      prompt: true,
      status: true,
      type: true,
    },
  });
  if (!question || question.order === null) notFound();
  const count = await prisma.question.count({ where: { lessonId } });

  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const lessonsBase = `${modulesBase}/${moduleId}/lessons`;
  const base = `${lessonsBase}/${lessonId}/questions`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/courses", label: "Cursos" },
        { href: `/admin/courses/${courseId}`, label: question.lesson?.module.subject.course.title ?? "Curso" },
        { href: modulesBase, label: question.lesson?.module.subject.title ?? "Disciplina" },
        { href: lessonsBase, label: question.lesson?.module.title ?? "Módulo" },
        { href: base, label: question.lesson?.title ?? "Aula" },
        { label: "Editar questão" },
      ]} />
      <AdminPageHeader actions={<Link className={buttonVariants({ variant: "outline" })} href={`${base}/${questionId}`}><Eye aria-hidden="true" />Visualizar</Link>} description="Atualize o enunciado, as alternativas, a explicação e a ordem." eyebrow="Questões" title="Editar questão" />
      <QuestionForm action={updateQuestionAction.bind(null, courseId, subjectId, moduleId, lessonId, questionId)} cancelHref={base} defaults={{ ...question, order: question.order }} maximumOrder={count} submitLabel="Salvar alterações" />
    </div>
  );
}

import { ArrowLeft, Check, Pencil, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { setQuestionStatusAction } from "@/app/admin/courses/question-actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusActions } from "@/components/admin/content-status-actions";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { QuestionDifficultyBadge, QuestionTypeBadge } from "@/components/admin/question-badges";
import { buttonVariants } from "@/components/ui/button";
import { ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Visualizar questão" };

export default async function QuestionDetailPage({ params }: { params: Promise<{ courseId: string; lessonId: string; moduleId: string; questionId: string; subjectId: string }> }) {
  const { courseId, lessonId, moduleId, questionId, subjectId } = await params;
  const question = await prisma.question.findFirst({
    where: { id: questionId, lessonId, lesson: { id: lessonId, moduleId, module: { subjectId, subject: { courseId } } } },
    select: {
      _count: { select: { assessmentQuestions: true, attemptAnswers: true } },
      answers: { orderBy: { order: "asc" }, select: { id: true, isCorrect: true, order: true, text: true } },
      difficulty: true,
      explanation: true,
      lesson: { select: { module: { select: { subject: { select: { course: { select: { title: true } }, title: true } }, title: true } }, title: true } },
      order: true,
      prompt: true,
      status: true,
      type: true,
      updatedAt: true,
    },
  });
  if (!question) notFound();

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
        { label: "Questão" },
      ]} />
      <AdminPageHeader
        actions={<><Link className={buttonVariants({ variant: "outline" })} href={base}><ArrowLeft aria-hidden="true" />Voltar</Link><Link className={buttonVariants()} href={`${base}/${questionId}/edit`}><Pencil aria-hidden="true" />Editar</Link></>}
        description={`Questão ${question.order ?? "sem ordem"}, atualizada em ${question.updatedAt.toLocaleString("pt-BR")}.`}
        eyebrow="Visualização administrativa"
        title="Questão"
      />

      <section className="space-y-6 rounded-lg border bg-background p-5 sm:p-6">
        <div className="flex flex-wrap gap-2"><ContentStatusBadge status={question.status} /><QuestionTypeBadge type={question.type} /><QuestionDifficultyBadge difficulty={question.difficulty} /></div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Enunciado</h2>
          <p className="mt-2 whitespace-pre-wrap text-base leading-7">{question.prompt}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Alternativas</h2>
          <ol className="mt-3 divide-y overflow-hidden rounded-md border">
            {question.answers.map((answer) => (
              <li className="flex items-start gap-3 p-3" key={answer.id}>
                <span className={answer.isCorrect ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800" : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"}>
                  {answer.isCorrect ? <Check aria-label="Correta" className="size-3.5" /> : <X aria-label="Incorreta" className="size-3.5" />}
                </span>
                <span className="min-w-0 whitespace-pre-wrap text-sm leading-6">{answer.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Explicação</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{question.explanation || "Nenhuma explicação cadastrada."}</p>
        </div>
        <p className="text-xs text-muted-foreground">Usada em {question._count.assessmentQuestions} avaliação(ões) e {question._count.attemptAnswers} resposta(s) histórica(s).</p>
      </section>

      <ContentStatusActions
        archiveAction={setQuestionStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, questionId, ContentStatus.ARCHIVED)}
        entityLabel="questão"
        entityTitle={question.prompt}
        publishAction={setQuestionStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, questionId, ContentStatus.PUBLISHED)}
        status={question.status}
        unpublishAction={setQuestionStatusAction.bind(null, courseId, subjectId, moduleId, lessonId, questionId, ContentStatus.DRAFT)}
      />
    </div>
  );
}

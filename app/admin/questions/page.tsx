import { ArrowRight, FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { QuestionDifficultyBadge, QuestionTypeBadge } from "@/components/admin/question-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Questões" };

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      difficulty: true,
      id: true,
      lesson: { select: { id: true, module: { select: { id: true, subject: { select: { course: { select: { id: true, title: true } }, id: true }, }, }, }, title: true } },
      prompt: true,
      status: true,
      type: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[{ href: "/admin", label: "Dashboard" }, { label: "Questões" }]} />
      <AdminPageHeader description="Consulte as questões cadastradas e acesse a edição dentro da estrutura acadêmica correspondente." eyebrow="Conteúdo avaliativo" title="Questões" />
      {questions.length === 0 ? <section className="nova-surface"><EmptyState description="Crie questões a partir de uma aula dentro da estrutura de cursos." icon={FileQuestion} title="Nenhuma questão cadastrada" /></section> : (
        <section className="nova-surface divide-y overflow-hidden" aria-label="Lista de questões">
          {questions.map((question) => {
            const lesson = question.lesson;
            const subject = lesson?.module.subject;
            const href = lesson && subject ? `/admin/courses/${subject.course.id}/subjects/${subject.id}/modules/${lesson.module.id}/lessons/${lesson.id}/questions/${question.id}` : null;
            return <article className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" key={question.id}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><ContentStatusBadge status={question.status} /><QuestionTypeBadge type={question.type} /><QuestionDifficultyBadge difficulty={question.difficulty} /></div><h2 className="mt-3 line-clamp-2 font-semibold">{question.prompt}</h2><p className="mt-2 text-xs text-muted-foreground">{lesson && subject ? `${subject.course.title} · ${lesson.title}` : "Questão sem aula associada"} · atualizada em {question.updatedAt.toLocaleDateString("pt-BR")}</p></div>{href ? <Link className={buttonVariants({ variant: "outline" })} href={href}>Visualizar<ArrowRight aria-hidden="true" /></Link> : null}</article>;
          })}
        </section>
      )}
    </div>
  );
}

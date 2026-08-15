/* eslint-disable @next/next/no-img-element -- course covers use administrator-provided remote URLs */

import { ArrowRight, BookOpen, Layers3, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AssessmentProgressList } from "@/components/student/assessment-progress-list";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { getStudentProgressDashboard } from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";
import { studentSubjectPath } from "@/lib/student-learning";

export const metadata: Metadata = { title: "Curso" };

export default async function StudentCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const [{ courseId }, session] = await Promise.all([params, requireRole(UserRole.STUDENT)]);
  const dashboard = await getStudentProgressDashboard(session.user.id, courseId);
  const course = dashboard.courses[0];
  if (!course) notFound();

  return (
    <Container className="max-w-[96rem] space-y-6 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Dashboard" }, { href: "/student#meus-cursos", label: "Meus cursos" }, { label: course.course.title }]} />

      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-center">
        <div className="min-w-0">
          <span className={course.isCompleted ? "inline-flex rounded-full bg-accent/12 px-2.5 py-1 text-xs font-bold text-[var(--nova-success)]" : "inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary"}>
            {course.isCompleted ? "CURSO CONCLUÍDO" : "EM ANDAMENTO"}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">{course.course.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{course.course.description || "Sem descrição disponível."}</p>
          <dl className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <div><dt className="text-xs text-muted-foreground">Disciplinas</dt><dd className="mt-1 font-semibold">{course.subjects.length}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Módulos</dt><dd className="mt-1 font-semibold">{course.modulesTotal}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Aulas</dt><dd className="mt-1 font-semibold">{course.lessonProgress.total}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Avaliações</dt><dd className="mt-1 font-semibold">{course.assessmentSummary.available}</dd></div>
          </dl>
        </div>
        <div className="aspect-[16/9] overflow-hidden rounded-lg bg-sidebar shadow-[var(--nova-shadow-md)]">
          {course.course.coverImageUrl ? <img alt={`Capa do curso ${course.course.title}`} className="h-full w-full object-cover" src={course.course.coverImageUrl} /> : <div className="grid h-full place-items-center text-white/80"><BookOpen aria-hidden="true" className="size-14" /></div>}
        </div>
      </header>

      <div className="flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Seções do curso" className="flex gap-1 overflow-x-auto">
          {[{ href: "#visao-geral", label: "Visão geral" }, { href: "#conteudo", label: "Conteúdo" }, { href: "#avaliacoes", label: "Avaliações" }].map((item, index) => (
            <a className={index === 0 ? "nova-focus whitespace-nowrap border-b-2 border-primary px-4 py-3 text-sm font-semibold text-primary" : "nova-focus whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"} href={item.href} key={item.href}>{item.label}</a>
          ))}
        </nav>
        {course.continuation ? <Link className={buttonVariants({ size: "lg" })} href={course.continuation.href}><Play aria-hidden="true" />Continuar curso</Link> : null}
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]" id="visao-geral">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Seu progresso</h2></CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <ProgressRing label="concluído" percentage={course.lessonProgress.percentage} />
            <div className="space-y-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 border-b pb-3"><dt className="text-muted-foreground">Progresso geral</dt><dd className="font-semibold">{formatPercentage(course.lessonProgress.percentage)}</dd></div>
                <div className="flex justify-between gap-3 border-b pb-3"><dt className="text-muted-foreground">Aulas concluídas</dt><dd className="font-semibold">{course.lessonProgress.completed} de {course.lessonProgress.total}</dd></div>
                <div className="flex justify-between gap-3 border-b pb-3"><dt className="text-muted-foreground">Módulos concluídos</dt><dd className="font-semibold">{course.modulesCompleted} de {course.modulesTotal}</dd></div>
                <div className="flex justify-between gap-3 border-b pb-3"><dt className="text-muted-foreground">Média das avaliações</dt><dd className="font-semibold">{formatPercentage(course.assessmentSummary.averagePercentage)}</dd></div>
              </dl>
              <StudentProgressBar {...course.lessonProgress} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Sobre o curso</h2></CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{course.course.description || "Este curso reúne conteúdos organizados em disciplinas, módulos e aulas."}</p>
            <dl className="mt-5 divide-y text-sm">
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Disciplinas</dt><dd className="font-semibold">{course.subjects.length}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Módulos</dt><dd className="font-semibold">{course.modulesTotal}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Status</dt><dd className="font-semibold">{course.isCompleted ? "Concluído" : "Em andamento"}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" id="conteudo" aria-labelledby="content-title">
        <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold" id="content-title">Conteúdo do curso</h2><p className="mt-1 text-sm text-muted-foreground">Acesse as disciplinas e acompanhe o progresso de cada etapa.</p></div><span className="text-sm font-semibold text-primary">{course.modulesTotal} módulos • {course.lessonProgress.total} aulas</span></div>
        {course.subjects.length === 0 ? <Card><EmptyState description="O conteúdo publicado deste curso aparecerá aqui quando estiver disponível." icon={BookOpen} title="Curso sem conteúdo publicado" /></Card> : (
          <Card className="divide-y overflow-hidden">
            {course.subjects.map((subject) => (
              <article className="p-5 sm:p-6" key={subject.id}>
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/8 font-heading font-bold text-primary">{subject.order}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">DISCIPLINA {subject.order}</p>
                    <h3 className="mt-1 font-heading font-semibold">{subject.title}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{subject.description || "Sem descrição disponível."}</p>
                  </div>
                  <div className="w-full md:w-52"><StudentProgressBar {...subject.lessonProgress} /></div>
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Layers3 aria-hidden="true" className="size-4" />{subject.modules.length} módulo(s)</span>
                  <Link aria-label={`Abrir ${subject.title}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={studentSubjectPath(courseId, subject.id)}><ArrowRight aria-hidden="true" /></Link>
                </div>
              </article>
            ))}
          </Card>
        )}
      </section>

      <section className="space-y-4" id="avaliacoes" aria-labelledby="course-assessments-title">
        <div><h2 className="text-xl font-semibold" id="course-assessments-title">Avaliações e resultados</h2><p className="mt-1 text-sm text-muted-foreground">{course.assessmentSummary.answeredQuestions} questão(ões) respondida(s), com {course.assessmentSummary.correctQuestions} acerto(s).</p></div>
        <AssessmentProgressList assessments={course.assessments} />
      </section>
    </Container>
  );
}

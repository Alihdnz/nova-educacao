import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AssessmentProgressList } from "@/components/student/assessment-progress-list";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { LessonProgressBadge, StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { getStudentProgressDashboard } from "@/lib/student-progress";
import { studentCoursePath, studentSubjectPath } from "@/lib/student-learning";

export const metadata: Metadata = { title: "Módulo" };

export default async function StudentModulePage({ params }: { params: Promise<{ courseId: string; moduleId: string; subjectId: string }> }) {
  const [{ courseId, moduleId, subjectId }, session] = await Promise.all([params, requireRole(UserRole.STUDENT)]);
  const dashboard = await getStudentProgressDashboard(session.user.id, courseId);
  const course = dashboard.courses[0];
  const subject = course?.subjects.find((item) => item.id === subjectId);
  const courseModule = subject?.modules.find((item) => item.id === moduleId);
  if (!course || !subject || !courseModule) notFound();

  return (
    <Container className="max-w-[96rem] space-y-6 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Dashboard" }, { href: studentCoursePath(courseId), label: course.course.title }, { href: studentSubjectPath(courseId, subjectId), label: subject.title }, { label: courseModule.title }]} />

      <header className="grid gap-6 border-b pb-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <span className="inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary">MÓDULO {courseModule.order}</span>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">{courseModule.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{courseModule.description || "Sem descrição disponível."}</p>
          <dl className="mt-5 flex flex-wrap gap-6 text-sm">
            <div className="inline-flex items-center gap-2"><BookOpen aria-hidden="true" className="size-4 text-primary" /><span><strong>{courseModule.lessons.length}</strong> aulas</span></div>
            <div className="inline-flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="size-4 text-[var(--nova-success)]" /><span><strong>{courseModule.lessonProgress.completed}</strong> concluídas</span></div>
            <div className="inline-flex items-center gap-2"><ClipboardCheck aria-hidden="true" className="size-4 text-[var(--nova-warning)]" /><span><strong>{courseModule.assessmentSummary.available}</strong> avaliações</span></div>
          </dl>
        </div>
        {courseModule.nextLesson ? <Link className={buttonVariants({ size: "lg" })} href={courseModule.nextLesson.href}><PlayCircle aria-hidden="true" />Continuar módulo</Link> : null}
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="space-y-4" aria-labelledby="lessons-title">
          <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold" id="lessons-title">Aulas do módulo</h2><p className="mt-1 text-sm text-muted-foreground">Siga a sequência publicada ou retome uma aula já iniciada.</p></div><span className="text-sm font-semibold text-primary">{courseModule.lessonProgress.completed} de {courseModule.lessonProgress.total}</span></div>
          {courseModule.lessons.length === 0 ? <Card><EmptyState description="As aulas aparecerão quando forem publicadas para os estudantes." icon={BookOpen} title="Módulo sem aulas publicadas" /></Card> : (
            <Card className="divide-y overflow-hidden">
              {courseModule.lessons.map((lesson) => (
                <article className="group flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5" key={lesson.id}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/8 text-primary"><PlayCircle aria-hidden="true" className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">AULA {courseModule.order}.{lesson.order}</p>
                    <h3 className="mt-1 font-heading text-sm font-semibold sm:text-base">{lesson.title}</h3>
                    {lesson.description ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{lesson.description}</p> : null}
                  </div>
                  <LessonProgressBadge status={lesson.status} />
                  {lesson.completedAt ? <time className="text-xs text-muted-foreground">{lesson.completedAt.toLocaleDateString("pt-BR")}</time> : null}
                  <Link aria-label={`Abrir ${lesson.title}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={lesson.href}><ArrowRight aria-hidden="true" /></Link>
                </article>
              ))}
            </Card>
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader><h2 className="text-base font-semibold">Progresso do módulo</h2></CardHeader>
            <CardContent className="flex flex-col items-center gap-5">
              <ProgressRing label="concluído" percentage={courseModule.lessonProgress.percentage} />
              <div className="w-full"><StudentProgressBar {...courseModule.lessonProgress} /></div>
              <dl className="w-full divide-y text-sm">
                <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Avaliações realizadas</dt><dd className="font-semibold">{courseModule.assessmentSummary.performed}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Questões respondidas</dt><dd className="font-semibold">{courseModule.assessmentSummary.answeredQuestions}</dd></div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="text-base font-semibold">Sobre este módulo</h2></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">{courseModule.description || "Conteúdo organizado para avançar de forma progressiva."}</p></CardContent>
          </Card>
        </aside>
      </div>

      <section className="space-y-4" aria-labelledby="module-assessments-title">
        <div><h2 className="text-xl font-semibold" id="module-assessments-title">Avaliações do módulo</h2><p className="mt-1 text-sm text-muted-foreground">Tentativas submetidas, última nota e melhor resultado.</p></div>
        <AssessmentProgressList assessments={courseModule.assessments} />
      </section>
    </Container>
  );
}

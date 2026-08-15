/* eslint-disable @next/next/no-img-element -- course covers use administrator-provided remote URLs */

import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CircleCheckBig,
  ClipboardCheck,
  GraduationCap,
  Target,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatCard } from "@/components/shared/stat-card";
import { AssessmentProgressList } from "@/components/student/assessment-progress-list";
import { StudentCourseCard } from "@/components/student/student-course-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import {
  getStudentProgressDashboard,
} from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";

export const metadata: Metadata = { title: "Dashboard do aluno" };

export default async function StudentPage() {
  const session = await requireRole(UserRole.STUDENT);
  const dashboard = await getStudentProgressDashboard(session.user.id);
  const { overall } = dashboard;
  const inProgressCourses = dashboard.courses.filter((course) => !course.isCompleted);
  const completedCourses = dashboard.courses.filter((course) => course.isCompleted);
  const continuationCourse = dashboard.continuation
    ? dashboard.courses.find((course) => course.course.id === dashboard.continuation?.courseId)
    : null;

  return (
    <Container className="max-w-[96rem] space-y-7 py-6 sm:py-8 lg:space-y-8">
      <header>
        <p className="text-sm font-semibold text-primary">Bem-vindo de volta,</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{session.user.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Continue sua jornada de conhecimento.</p>
      </header>

      {dashboard.courses.length === 0 ? (
        <Card id="meus-cursos">
          <EmptyState description="Quando uma matrícula for disponibilizada para sua conta, seu progresso aparecerá nesta área." icon={BookOpenCheck} title="Você ainda não possui cursos matriculados" />
        </Card>
      ) : (
        <>
          <section aria-label="Resumo da jornada" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard accent="primary" detail="Continuar aprendendo" icon={GraduationCap} label="Cursos em andamento" value={overall.coursesInProgress} />
            <StatCard accent="accent" detail={`${overall.lessonProgress.total} aulas disponíveis`} icon={CircleCheckBig} label="Aulas concluídas" value={overall.lessonProgress.completed} />
            <StatCard accent="warning" detail={`${overall.assessmentSummary.attempts} tentativa(s)`} icon={ClipboardCheck} label="Avaliações realizadas" value={overall.assessmentSummary.performed} />
            <StatCard accent="info" detail={`${overall.assessmentSummary.correctQuestions} resposta(s) correta(s)`} icon={Target} label="Aproveitamento" value={formatPercentage(overall.assessmentSummary.accuracy)} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
            {dashboard.continuation ? (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">Continue de onde parou</h2>
                  <span className="text-xs font-semibold text-primary">Próxima aula</span>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1fr)] sm:items-center">
                    <div className="aspect-[16/9] overflow-hidden rounded-lg bg-sidebar">
                      {continuationCourse?.course.coverImageUrl ? (
                        <img alt="" className="h-full w-full object-cover" src={continuationCourse.course.coverImageUrl} />
                      ) : (
                        <div className="grid h-full place-items-center text-white/80"><BookOpen aria-hidden="true" className="size-10" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary">{dashboard.continuation.courseTitle}</p>
                      <h3 className="mt-2 font-heading text-xl font-semibold">{dashboard.continuation.lesson.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{dashboard.continuation.lesson.description || "Retome seus estudos a partir da próxima aula disponível."}</p>
                      <Link className={buttonVariants({ className: "mt-5", size: "lg" })} href={dashboard.continuation.lesson.href}>
                        Continuar estudando <ArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader><h2 className="text-lg font-semibold">Seu progresso geral</h2></CardHeader>
              <CardContent className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
                <ProgressRing label="concluído" percentage={overall.lessonProgress.percentage} />
                <dl className="w-full min-w-0 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Cursos concluídos</dt><dd className="font-semibold">{overall.coursesCompleted} de {overall.coursesTotal}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Disciplinas</dt><dd className="font-semibold">{overall.subjectsCompleted} de {overall.subjectsTotal}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Módulos</dt><dd className="font-semibold">{overall.modulesCompleted} de {overall.modulesTotal}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Aulas</dt><dd className="font-semibold">{overall.lessonProgress.completed} de {overall.lessonProgress.total}</dd></div>
                </dl>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4" id="meus-cursos" aria-labelledby="active-courses-title">
            <div className="flex items-end justify-between gap-4">
              <div><h2 className="text-xl font-semibold" id="active-courses-title">Cursos em andamento</h2><p className="mt-1 text-sm text-muted-foreground">Acompanhe o progresso e retome a próxima aula.</p></div>
              <span className="text-sm font-semibold text-primary">{inProgressCourses.length} curso(s)</span>
            </div>
            {inProgressCourses.length > 0 ? <div className="grid gap-4 xl:grid-cols-2">{inProgressCourses.map((course) => <StudentCourseCard course={course} key={course.enrollmentId} />)}</div> : <Card><EmptyState description="Todos os conteúdos disponíveis foram concluídos." icon={CircleCheckBig} title="Nenhum curso em andamento" /></Card>}
          </section>

          {completedCourses.length > 0 ? (
            <section className="space-y-4" aria-labelledby="completed-courses-title">
              <div><h2 className="text-xl font-semibold" id="completed-courses-title">Cursos concluídos</h2><p className="mt-1 text-sm text-muted-foreground">Revise conteúdos que você já finalizou.</p></div>
              <div className="grid gap-4 xl:grid-cols-2">{completedCourses.map((course) => <StudentCourseCard course={course} key={course.enrollmentId} />)}</div>
            </section>
          ) : null}

          <section className="space-y-4" aria-labelledby="assessment-progress-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="text-xl font-semibold" id="assessment-progress-title">Resultados e progresso</h2><p className="mt-1 text-sm text-muted-foreground">Média das tentativas: {formatPercentage(overall.assessmentSummary.averagePercentage)}.</p></div>
              <p className="text-sm text-muted-foreground">{overall.assessmentSummary.correctQuestions} acerto(s) em {overall.assessmentSummary.answeredQuestions} resposta(s)</p>
            </div>
            <AssessmentProgressList assessments={dashboard.assessments} emptyMessage="Você ainda não realizou avaliações." showCourse />
          </section>
        </>
      )}
    </Container>
  );
}

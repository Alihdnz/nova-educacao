import { BarChart3, BookOpenCheck, CircleCheckBig, GraduationCap, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatCard } from "@/components/shared/stat-card";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { getStudentProgressDashboard } from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";
import { studentCoursePath } from "@/lib/student-learning";

export const metadata: Metadata = { title: "Progresso" };

export default async function StudentProgressPage() {
  const session = await requireRole(UserRole.STUDENT);
  const dashboard = await getStudentProgressDashboard(session.user.id);
  const { overall } = dashboard;

  return (
    <Container className="max-w-[96rem] space-y-7 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Início" }, { label: "Progresso" }]} />
      <header><p className="text-sm font-semibold text-primary">Sua evolução</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Progresso</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Resumo consolidado das aulas, estruturas concluídas e avaliações realizadas.</p></header>
      {dashboard.courses.length === 0 ? <Card><EmptyState description="Seu progresso será calculado quando houver um curso matriculado." icon={BookOpenCheck} title="Nenhum progresso disponível" /></Card> : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Indicadores de progresso">
            <StatCard accent="primary" detail={`${overall.coursesCompleted} concluído(s)`} icon={GraduationCap} label="Cursos" value={overall.coursesTotal} />
            <StatCard accent="accent" detail={`${overall.lessonProgress.total} disponíveis`} icon={CircleCheckBig} label="Aulas concluídas" value={overall.lessonProgress.completed} />
            <StatCard accent="info" detail={`${overall.subjectsCompleted} disciplina(s)`} icon={Layers3} label="Módulos concluídos" value={overall.modulesCompleted} />
            <StatCard accent="warning" detail={`${overall.assessmentSummary.attempts} tentativa(s)`} icon={BarChart3} label="Média das avaliações" value={formatPercentage(overall.assessmentSummary.averagePercentage)} />
          </section>
          <Card>
            <CardHeader><h2 className="text-lg font-semibold">Progresso geral das aulas</h2></CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center"><ProgressRing label="concluído" percentage={overall.lessonProgress.percentage} /><div><StudentProgressBar {...overall.lessonProgress} /><p className="mt-4 text-sm leading-6 text-muted-foreground">{overall.lessonProgress.completed} de {overall.lessonProgress.total} aulas concluídas em todos os seus cursos.</p></div></CardContent>
          </Card>
          <section className="space-y-4" aria-labelledby="course-progress-title">
            <div><h2 className="text-xl font-semibold" id="course-progress-title">Progresso por curso</h2><p className="mt-1 text-sm text-muted-foreground">Acesse o curso para consultar os detalhes por disciplina e módulo.</p></div>
            <div className="nova-surface divide-y overflow-hidden">
              {dashboard.courses.map((course) => <article className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_16rem_auto] md:items-center" key={course.enrollmentId}><div><h3 className="font-semibold">{course.course.title}</h3><p className="mt-1 text-xs text-muted-foreground">{course.lessonProgress.completed} de {course.lessonProgress.total} aulas · {course.modulesCompleted} de {course.modulesTotal} módulos</p></div><StudentProgressBar {...course.lessonProgress} /><Link className={buttonVariants({ variant: "outline" })} href={studentCoursePath(course.course.id)}>Detalhes</Link></article>)}
            </div>
          </section>
        </>
      )}
    </Container>
  );
}

import { ArrowRight, BookOpenText, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { AssessmentProgressList } from "@/components/student/assessment-progress-list";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { getStudentProgressDashboard } from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";
import {
  studentCoursePath,
  studentModulePath,
} from "@/lib/student-learning";

export const metadata: Metadata = { title: "Disciplina" };

export default async function StudentSubjectPage({
  params,
}: {
  params: Promise<{ courseId: string; subjectId: string }>;
}) {
  const [{ courseId, subjectId }, session] = await Promise.all([
    params,
    requireRole(UserRole.STUDENT),
  ]);
  const dashboard = await getStudentProgressDashboard(session.user.id, courseId);
  const course = dashboard.courses[0];
  const subject = course?.subjects.find((item) => item.id === subjectId);
  if (!course || !subject) notFound();

  return (
    <Container className="max-w-[96rem] space-y-8 py-6 sm:py-8">
      <StudentBreadcrumbs
        items={[
          { href: "/student", label: "Início" },
          { href: studentCoursePath(courseId), label: course.course.title },
          { label: subject.title },
        ]}
      />

      <header className="grid gap-6 border-b pb-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Disciplina {subject.order}
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{subject.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {subject.description || "Sem descrição disponível."}
          </p>
        </div>
        <StudentProgressBar {...subject.lessonProgress} />
      </header>

      <section
        aria-label="Resumo da disciplina"
        className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3"
      >
        <div className="bg-background p-4">
          <p className="text-xs text-muted-foreground">Módulos concluídos</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {subject.modulesCompleted} de {subject.modules.length}
          </p>
        </div>
        <div className="bg-background p-4">
          <p className="text-xs text-muted-foreground">Avaliações realizadas</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {subject.assessmentSummary.performed}
          </p>
        </div>
        <div className="bg-background p-4">
          <p className="text-xs text-muted-foreground">Média das tentativas</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatPercentage(subject.assessmentSummary.averagePercentage)}
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="modules-title">
        <div>
          <h2 className="text-lg font-semibold" id="modules-title">
            Módulos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O percentual é calculado pelas aulas de cada módulo.
          </p>
        </div>

        {subject.modules.length === 0 ? (
          <div className="nova-surface">
            <EmptyState
              description="Os módulos publicados desta disciplina aparecerão aqui."
              icon={Layers3}
              title="Disciplina sem conteúdo publicado"
            />
          </div>
        ) : (
          <div className="nova-surface divide-y overflow-hidden">
            {subject.modules.map((module) => (
              <article
                className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center"
                key={module.id}
              >
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
                    {module.order}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {module.description || "Sem descrição disponível."}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpenText aria-hidden="true" className="size-3.5" />
                      {module.lessons.length} aula(s) · {module.assessmentSummary.performed} avaliação(ões)
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <StudentProgressBar {...module.lessonProgress} />
                  <Link
                    className={buttonVariants({ className: "w-full", variant: "outline" })}
                    href={studentModulePath(courseId, subjectId, module.id)}
                  >
                    Acessar módulo
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="subject-assessments-title">
        <div>
          <h2 className="text-lg font-semibold" id="subject-assessments-title">
            Avaliações da disciplina
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Resultados submetidos permanecem disponíveis no histórico.
          </p>
        </div>
        <AssessmentProgressList assessments={subject.assessments} />
      </section>
    </Container>
  );
}

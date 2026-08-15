/* eslint-disable @next/next/no-img-element -- course covers use administrator-provided remote URLs */

import { ArrowRight, BookOpenText, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import {
  getStudentCourse,
  progressMap,
  progressSummary,
  studentSubjectPath,
} from "@/lib/student-learning";

export const metadata: Metadata = { title: "Curso" };

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [{ courseId }, session] = await Promise.all([
    params,
    requireRole(UserRole.STUDENT),
  ]);
  const enrollment = await getStudentCourse(session.user.id, courseId);
  if (!enrollment) notFound();

  const records = progressMap(enrollment.progresses);
  const lessonIds = enrollment.course.subjects.flatMap((subject) =>
    subject.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)),
  );
  const courseProgress = progressSummary(
    lessonIds,
    records,
    enrollment.status,
  );

  return (
    <Container className="space-y-8 py-8 sm:py-10">
      <StudentBreadcrumbs
        items={[
          { href: "/student", label: "Início" },
          { href: "/student#meus-cursos", label: "Meus cursos" },
          { label: enrollment.course.title },
        ]}
      />

      <header className="grid gap-6 border-b pb-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Curso matriculado</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {enrollment.course.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {enrollment.course.description || "Sem descrição disponível."}
          </p>
        </div>
        <StudentProgressBar {...courseProgress} />
      </header>

      {enrollment.course.coverImageUrl ? (
        <div className="aspect-[16/5] max-h-72 overflow-hidden rounded-lg border bg-muted">
          <img
            alt={`Capa do curso ${enrollment.course.title}`}
            className="h-full w-full object-cover"
            src={enrollment.course.coverImageUrl}
          />
        </div>
      ) : null}

      <section className="space-y-4" aria-labelledby="subjects-title">
        <div>
          <h2 className="text-lg font-semibold" id="subjects-title">
            Disciplinas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Siga a sequência definida para o curso.
          </p>
        </div>

        {enrollment.course.subjects.length === 0 ? (
          <div className="rounded-lg border bg-background">
            <EmptyState
              description="O conteúdo publicado deste curso aparecerá aqui quando estiver disponível."
              icon={BookOpenText}
              title="Curso sem conteúdo publicado"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollment.course.subjects.map((subject) => {
              const subjectLessonIds = subject.modules.flatMap((module) =>
                module.lessons.map((lesson) => lesson.id),
              );
              const subjectProgress = progressSummary(subjectLessonIds, records);

              return (
                <article className="rounded-lg border bg-background p-5" key={subject.id}>
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sm font-semibold text-sky-800 tabular-nums">
                      {subject.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">{subject.title}</h3>
                        <span className="text-xs font-medium text-emerald-700">Disponível</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {subject.description || "Sem descrição disponível."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <StudentProgressBar {...subjectProgress} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Layers3 aria-hidden="true" className="size-4" />
                      {subject.modules.length} módulo(s)
                    </span>
                    <Link
                      className={buttonVariants({ variant: "outline" })}
                      href={studentSubjectPath(courseId, subject.id)}
                    >
                      Ver disciplina
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </Container>
  );
}

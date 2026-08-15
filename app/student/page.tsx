/* eslint-disable @next/next/no-img-element -- course covers use administrator-provided remote URLs */

import {
  ArrowRight,
  BookOpenCheck,
  CircleCheckBig,
  Clock3,
  GraduationCap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import {
  EnrollmentStatus,
  ProgressStatus,
  UserRole,
} from "@/lib/generated/prisma/client";
import {
  continuationLesson,
  getStudentDashboard,
  lessonHref,
  progressMap,
  progressSummary,
  studentCoursePath,
  type StudentLessonSummary,
} from "@/lib/student-learning";

export const metadata: Metadata = {
  title: "Área do estudante",
};

export default async function StudentPage() {
  const session = await requireRole(UserRole.STUDENT);
  const enrollments = await getStudentDashboard(session.user.id);
  const courses = enrollments.map((enrollment) => {
    const lessons: StudentLessonSummary[] = enrollment.course.subjects.flatMap(
      (subject) =>
        subject.modules.flatMap((module) =>
          module.lessons.map((lesson) => ({
            ...lesson,
            moduleId: module.id,
            moduleTitle: module.title,
            subjectId: subject.id,
            subjectTitle: subject.title,
          })),
        ),
    );
    const records = progressMap(enrollment.progresses);

    return {
      ...enrollment,
      continuation: continuationLesson(lessons, records),
      hasInProgress: lessons.some(
        (lesson) => records.get(lesson.id) === ProgressStatus.IN_PROGRESS,
      ),
      lessons,
      progress: progressSummary(
        lessons.map((lesson) => lesson.id),
        records,
        enrollment.status,
      ),
      records,
    };
  });
  const activeCourses = courses.filter(
    (course) => course.status === EnrollmentStatus.ACTIVE,
  );
  const completedCourses = courses.filter(
    (course) => course.status === EnrollmentStatus.COMPLETED,
  );
  const continueCourse =
    activeCourses.find((course) => course.hasInProgress) ??
    activeCourses.find((course) => course.continuation) ??
    completedCourses.find((course) => course.continuation) ??
    courses[0] ??
    null;

  return (
    <Container className="space-y-9 py-8 sm:py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Área do estudante</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          Olá, {session.user.name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Acesse seus cursos e retome seus estudos de onde parou.
        </p>
      </header>

      {courses.length > 0 ? (
        <>
          <section aria-labelledby="summary-title">
            <h2 className="sr-only" id="summary-title">
              Resumo dos cursos
            </h2>
            <div className="grid divide-y overflow-hidden rounded-lg border bg-background sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3 p-4 sm:p-5">
                <span className="flex size-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <GraduationCap aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Matriculados</p>
                  <p className="text-lg font-semibold tabular-nums">{courses.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 sm:p-5">
                <span className="flex size-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <Clock3 aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                  <p className="text-lg font-semibold tabular-nums">{activeCourses.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 sm:p-5">
                <span className="flex size-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <CircleCheckBig aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {completedCourses.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {continueCourse ? (
            <section
              className="flex flex-col gap-5 border-y bg-background py-6 sm:flex-row sm:items-center sm:justify-between"
              aria-labelledby="continue-title"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-emerald-700">Continuar estudando</p>
                <h2 className="mt-1 text-xl font-semibold" id="continue-title">
                  {continueCourse.continuation?.title ?? continueCourse.course.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {continueCourse.continuation
                    ? `${continueCourse.course.title} · ${continueCourse.continuation.moduleTitle}`
                    : "Este curso ainda não possui aulas publicadas."}
                </p>
              </div>
              <Link
                className={buttonVariants({ size: "lg" })}
                href={
                  continueCourse.continuation
                    ? lessonHref(
                        continueCourse.course.id,
                        continueCourse.continuation,
                      )
                    : studentCoursePath(continueCourse.course.id)
                }
              >
                {continueCourse.continuation ? "Continuar estudando" : "Ver curso"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </section>
          ) : null}

          <section className="space-y-4" id="meus-cursos" aria-labelledby="courses-title">
            <div>
              <h2 className="text-lg font-semibold" id="courses-title">
                Meus cursos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Somente cursos com matrícula válida aparecem aqui.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {courses.map((course) => (
                <article
                  className="overflow-hidden rounded-lg border bg-background"
                  key={course.id}
                >
                  {course.course.coverImageUrl ? (
                    <div className="aspect-[16/7] overflow-hidden border-b bg-muted">
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={course.course.coverImageUrl}
                      />
                    </div>
                  ) : null}
                  <div className="space-y-5 p-5">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold">{course.course.title}</h3>
                        <span className="text-xs font-medium text-muted-foreground">
                          {course.status === EnrollmentStatus.COMPLETED
                            ? "Concluído"
                            : course.progress.completed === 0
                              ? "Comece sua jornada"
                              : "Em andamento"}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {course.course.description || "Sem descrição disponível."}
                      </p>
                    </div>
                    <StudentProgressBar {...course.progress} />
                    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="min-w-0 truncate text-sm text-muted-foreground">
                        {course.continuation
                          ? `Próxima: ${course.continuation.title}`
                          : "Nenhuma aula publicada"}
                      </p>
                      <Link
                        className={buttonVariants({ variant: "outline" })}
                        href={studentCoursePath(course.course.id)}
                      >
                        Acessar curso
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-lg border bg-background" id="meus-cursos">
          <EmptyState
            description="Quando uma matrícula for disponibilizada para sua conta, o curso aparecerá nesta área."
            icon={BookOpenCheck}
            title="Você ainda não possui cursos matriculados"
          />
        </section>
      )}
    </Container>
  );
}

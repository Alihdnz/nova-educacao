/* eslint-disable @next/next/no-img-element -- lesson media uses administrator-provided remote URLs */

import { ArrowLeft, ArrowRight, ClipboardCheck, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { completeLessonAction } from "@/app/student/lesson-actions";
import { LessonContentRenderer } from "@/components/content/lesson-content-renderer";
import { Container } from "@/components/layout/container";
import { CompleteLessonForm } from "@/components/student/complete-lesson-form";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { LessonProgressBadge } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import { ProgressStatus, UserRole } from "@/lib/generated/prisma/client";
import { studentAssessmentPath } from "@/lib/student-assessment";
import {
  getStudentLesson,
  lessonHref,
  lessonStatus,
  progressMap,
  studentCoursePath,
  studentModulePath,
  studentSubjectPath,
} from "@/lib/student-learning";

export const metadata: Metadata = { title: "Aula" };

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    lessonId: string;
    moduleId: string;
    subjectId: string;
  }>;
}) {
  const [{ courseId, lessonId, moduleId, subjectId }, session] =
    await Promise.all([params, requireRole(UserRole.STUDENT)]);
  const enrollment = await getStudentLesson(
    session.user.id,
    courseId,
    subjectId,
    moduleId,
    lessonId,
  );
  const subject = enrollment?.course.subjects[0];
  const courseModule = subject?.modules[0];
  const lesson = courseModule?.lessons[0];
  if (!enrollment || !subject || !courseModule || !lesson) notFound();

  const status = lessonStatus(lesson.id, progressMap(enrollment.progresses));
  const currentIndex = enrollment.navigationLessons.findIndex(
    (navigationLesson) => navigationLesson.id === lesson.id,
  );
  const previousLesson =
    currentIndex > 0 ? enrollment.navigationLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < enrollment.navigationLessons.length - 1
      ? enrollment.navigationLessons[currentIndex + 1]
      : null;
  const completeAction = completeLessonAction.bind(
    null,
    courseId,
    subjectId,
    moduleId,
    lessonId,
  );

  return (
    <Container className="py-8 sm:py-10">
      <div className="space-y-8">
        <StudentBreadcrumbs
          items={[
            { href: "/student", label: "Início" },
            {
              href: studentCoursePath(courseId),
              label: enrollment.course.title,
            },
            {
              href: studentSubjectPath(courseId, subjectId),
              label: subject.title,
            },
            {
              href: studentModulePath(courseId, subjectId, moduleId),
              label: courseModule.title,
            },
            { label: lesson.title },
          ]}
        />

        <article className="mx-auto max-w-4xl">
          <header className="border-b pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Aula {lesson.order}
              </p>
              <LessonProgressBadge status={status} />
            </div>
            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{lesson.title}</h1>
            {lesson.description ? (
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {lesson.description}
              </p>
            ) : null}
          </header>

          {lesson.imageUrl ? (
            <div className="my-8 aspect-[16/8] max-h-[28rem] overflow-hidden rounded-lg border bg-muted">
              <img
                alt={`Imagem da aula ${lesson.title}`}
                className="h-full w-full object-cover"
                src={lesson.imageUrl}
              />
            </div>
          ) : null}

          <div className="py-2 sm:py-4">
            {lesson.content ? (
              <LessonContentRenderer content={lesson.content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Esta aula ainda não possui conteúdo textual.
              </p>
            )}
          </div>

          <section
            className="mt-10 flex flex-col gap-5 border-y py-6 sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="lesson-progress-title"
          >
            <div>
              <h2 className="text-sm font-semibold" id="lesson-progress-title">
                Progresso da aula
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Registre a conclusão quando terminar este conteúdo.
              </p>
            </div>
            <CompleteLessonForm
              action={completeAction}
              completed={status === ProgressStatus.COMPLETED}
            />
          </section>

          {lesson.assessments.length > 0 ? (
            <section className="mt-10 space-y-4" aria-labelledby="assessments-title">
              <div>
                <h2 className="text-lg font-semibold" id="assessments-title">
                  Avaliações
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Avaliações publicadas vinculadas a esta aula.
                </p>
              </div>
              <div className="divide-y overflow-hidden rounded-lg border bg-background">
                {lesson.assessments.map((assessment) => (
                  <article
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    key={assessment.id}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck
                          aria-hidden="true"
                          className="size-4 shrink-0 text-sky-700"
                        />
                        <h3 className="font-semibold">{assessment.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {assessment.description || "Sem instruções adicionais."}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Nota {assessment.maxScore.toString()}</span>
                        <span>
                          Aprovação {assessment.passingPercentage.toString()}%
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          {assessment.timeLimitMinutes
                            ? `${assessment.timeLimitMinutes} min`
                            : "Sem limite"}
                        </span>
                      </div>
                    </div>
                    <Link
                      className={buttonVariants({ variant: "outline" })}
                      href={studentAssessmentPath({
                        assessmentId: assessment.id,
                        courseId,
                        lessonId,
                        moduleId,
                        subjectId,
                      })}
                    >
                      Abrir avaliação
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="space-y-5 pt-6">
            <Link
              className={buttonVariants({ variant: "ghost" })}
              href={studentModulePath(courseId, subjectId, moduleId)}
            >
              <ArrowLeft aria-hidden="true" />
              Voltar ao módulo
            </Link>

            {previousLesson || nextLesson ? (
              <nav
                className="grid gap-3 sm:grid-cols-2"
                aria-label="Navegação entre aulas"
              >
                {previousLesson ? (
                  <Link
                    className="flex min-h-20 items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:bg-muted"
                    href={lessonHref(courseId, previousLesson)}
                  >
                    <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        Aula anterior
                      </span>
                      <span className="mt-1 block truncate text-sm font-medium">
                        {previousLesson.title}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
                {nextLesson ? (
                  <Link
                    className="flex min-h-20 items-center justify-end gap-3 rounded-lg border bg-background p-4 text-right transition-colors hover:bg-muted"
                    href={lessonHref(courseId, nextLesson)}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        Próxima aula
                      </span>
                      <span className="mt-1 block truncate text-sm font-medium">
                        {nextLesson.title}
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </footer>
        </article>
      </div>
    </Container>
  );
}

import { ArrowRight, BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import {
  LessonProgressBadge,
  StudentProgressBar,
} from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import {
  getStudentModule,
  lessonStatus,
  progressMap,
  progressSummary,
  studentCoursePath,
  studentLessonPath,
  studentSubjectPath,
} from "@/lib/student-learning";

export const metadata: Metadata = { title: "Módulo" };

export default async function StudentModulePage({
  params,
}: {
  params: Promise<{
    courseId: string;
    moduleId: string;
    subjectId: string;
  }>;
}) {
  const [{ courseId, moduleId, subjectId }, session] = await Promise.all([
    params,
    requireRole(UserRole.STUDENT),
  ]);
  const enrollment = await getStudentModule(
    session.user.id,
    courseId,
    subjectId,
    moduleId,
  );
  const subject = enrollment?.course.subjects[0];
  const courseModule = subject?.modules[0];
  if (!enrollment || !subject || !courseModule) notFound();

  const records = progressMap(enrollment.progresses);
  const moduleProgress = progressSummary(
    courseModule.lessons.map((lesson) => lesson.id),
    records,
  );

  return (
    <Container className="space-y-8 py-8 sm:py-10">
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
          { label: courseModule.title },
        ]}
      />

      <header className="grid gap-6 border-b pb-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Módulo {courseModule.order}</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{courseModule.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {courseModule.description || "Sem descrição disponível."}
          </p>
        </div>
        <StudentProgressBar {...moduleProgress} />
      </header>

      <section className="space-y-4" aria-labelledby="lessons-title">
        <div>
          <h2 className="text-lg font-semibold" id="lessons-title">
            Aulas publicadas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aulas em rascunho ou arquivadas não são exibidas.
          </p>
        </div>

        {courseModule.lessons.length === 0 ? (
          <div className="rounded-lg border bg-background">
            <EmptyState
              description="As aulas aparecerão quando forem publicadas para os estudantes."
              icon={BookOpenText}
              title="Módulo sem aulas publicadas"
            />
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border bg-background">
            {courseModule.lessons.map((lesson) => {
              const status = lessonStatus(lesson.id, records);

              return (
                <article
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  key={lesson.id}
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
                      {lesson.order}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <LessonProgressBadge status={status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {lesson.description || "Sem resumo disponível."}
                      </p>
                    </div>
                  </div>
                  <Link
                    className={buttonVariants({ variant: "outline" })}
                    href={studentLessonPath(
                      courseId,
                      subjectId,
                      moduleId,
                      lesson.id,
                    )}
                  >
                    Abrir aula
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Container>
  );
}

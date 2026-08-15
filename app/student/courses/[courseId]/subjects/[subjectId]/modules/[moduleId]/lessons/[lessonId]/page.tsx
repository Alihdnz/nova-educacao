/* eslint-disable @next/next/no-img-element -- lesson media uses administrator-provided remote URLs */

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonContentRenderer } from "@/components/content/lesson-content-renderer";
import { Container } from "@/components/layout/container";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { LessonProgressBadge } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import {
  getStudentLesson,
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

          <footer className="mt-10 border-t pt-6">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={studentModulePath(courseId, subjectId, moduleId)}
            >
              <ArrowLeft aria-hidden="true" />
              Voltar ao módulo
            </Link>
          </footer>
        </article>
      </div>
    </Container>
  );
}

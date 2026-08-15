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
  getStudentSubject,
  progressMap,
  progressSummary,
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
  const enrollment = await getStudentSubject(
    session.user.id,
    courseId,
    subjectId,
  );
  const subject = enrollment?.course.subjects[0];
  if (!enrollment || !subject) notFound();

  const records = progressMap(enrollment.progresses);
  const subjectProgress = progressSummary(
    subject.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id),
    ),
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
        <StudentProgressBar {...subjectProgress} />
      </header>

      <section className="space-y-4" aria-labelledby="modules-title">
        <div>
          <h2 className="text-lg font-semibold" id="modules-title">
            Módulos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A ordem abaixo corresponde à sequência da disciplina.
          </p>
        </div>

        {subject.modules.length === 0 ? (
          <div className="rounded-lg border bg-background">
            <EmptyState
              description="Os módulos publicados desta disciplina aparecerão aqui."
              icon={Layers3}
              title="Disciplina sem conteúdo publicado"
            />
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border bg-background">
            {subject.modules.map((module) => {
              const moduleProgress = progressSummary(
                module.lessons.map((lesson) => lesson.id),
                records,
              );

              return (
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
                        {module.lessons.length} aula(s) publicada(s)
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <StudentProgressBar {...moduleProgress} />
                    <Link
                      className={buttonVariants({ className: "w-full", variant: "outline" })}
                      href={studentModulePath(courseId, subjectId, module.id)}
                    >
                      Acessar módulo
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

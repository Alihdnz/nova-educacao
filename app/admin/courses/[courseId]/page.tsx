import { Boxes, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  moveSubjectAction,
  setCourseStatusAction,
  setSubjectStatusAction,
} from "@/app/admin/courses/actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminFeedback } from "@/components/admin/admin-feedback";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusActions } from "@/components/admin/content-status-actions";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Estrutura do curso" };

type CoursePageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const [{ courseId }, { error, success }] = await Promise.all([params, searchParams]);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      coverImageUrl: true,
      description: true,
      id: true,
      slug: true,
      status: true,
      subjects: {
        orderBy: { order: "asc" },
        select: {
          _count: { select: { modules: true } },
          id: true,
          order: true,
          slug: true,
          status: true,
          title: true,
          updatedAt: true,
        },
      },
      title: true,
      updatedAt: true,
    },
  });
  if (!course) notFound();

  return (
    <div className="space-y-7">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { label: course.title },
        ]}
      />
      <AdminPageHeader
        actions={
          <Link className={buttonVariants({ variant: "outline" })} href={`/admin/courses/${course.id}/edit`}>
            <Pencil aria-hidden="true" />
            Editar curso
          </Link>
        }
        description="Revise os dados do curso e organize suas disciplinas."
        eyebrow="Estrutura do curso"
        title={course.title}
      />
      <AdminFeedback error={error} success={success} />

      <section className="rounded-lg border bg-background p-5 sm:p-6" aria-labelledby="course-summary-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="course-summary-title" className="text-sm font-semibold">
                Resumo do curso
              </h2>
              <ContentStatusBadge status={course.status} />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="mt-0.5 break-all font-medium">{course.slug}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Última atualização</dt>
                <dd className="mt-0.5 font-medium">
                  {course.updatedAt.toLocaleString("pt-BR")}
                </dd>
              </div>
              {course.coverImageUrl ? (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">URL da capa</dt>
                  <dd className="mt-0.5 break-all font-medium">{course.coverImageUrl}</dd>
                </div>
              ) : null}
            </dl>
            <p className="max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {course.description || "Sem descrição cadastrada."}
            </p>
          </div>
          <ContentStatusActions
            archiveAction={setCourseStatusAction.bind(null, course.id, ContentStatus.ARCHIVED)}
            entityLabel="curso"
            entityTitle={course.title}
            publishAction={setCourseStatusAction.bind(null, course.id, ContentStatus.PUBLISHED)}
            status={course.status}
            unpublishAction={setCourseStatusAction.bind(null, course.id, ContentStatus.DRAFT)}
          />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="subjects-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="subjects-title" className="text-sm font-semibold">Disciplinas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A ordem abaixo define a sequência dentro deste curso.
            </p>
          </div>
          <Link
            className={buttonVariants()}
            href={`/admin/courses/${course.id}/subjects/new`}
          >
            <Plus aria-hidden="true" />
            Nova disciplina
          </Link>
        </div>

        {course.subjects.length === 0 ? (
          <div className="rounded-lg border bg-background">
            <EmptyState
              action={
                <Link
                  className={buttonVariants()}
                  href={`/admin/courses/${course.id}/subjects/new`}
                >
                  <Plus aria-hidden="true" />
                  Criar disciplina
                </Link>
              }
              description="Adicione a primeira disciplina para estruturar este curso."
              icon={Plus}
              title="Nenhuma disciplina cadastrada"
            />
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border bg-background">
            {course.subjects.map((subject, index) => (
              <article className="space-y-4 p-4 sm:p-5" key={subject.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
                      {subject.order}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{subject.title}</h3>
                        <ContentStatusBadge status={subject.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {subject.slug} · {subject._count.modules} módulo(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <OrderControls
                      downAction={moveSubjectAction.bind(null, course.id, subject.id, "down")}
                      first={index === 0}
                      last={index === course.subjects.length - 1}
                      upAction={moveSubjectAction.bind(null, course.id, subject.id, "up")}
                    />
                    <Link
                      className={buttonVariants({ variant: "outline" })}
                      href={`/admin/courses/${course.id}/subjects/${subject.id}/modules`}
                    >
                      <Boxes aria-hidden="true" />
                      Módulos
                    </Link>
                    <Link
                      aria-label={`Editar ${subject.title}`}
                      className={buttonVariants({ size: "icon", variant: "ghost" })}
                      href={`/admin/courses/${course.id}/subjects/${subject.id}/edit`}
                      title="Editar disciplina"
                    >
                      <Pencil aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <ContentStatusActions
                  archiveAction={setSubjectStatusAction.bind(
                    null,
                    course.id,
                    subject.id,
                    ContentStatus.ARCHIVED,
                  )}
                  entityLabel="disciplina"
                  entityTitle={subject.title}
                  publishAction={setSubjectStatusAction.bind(
                    null,
                    course.id,
                    subject.id,
                    ContentStatus.PUBLISHED,
                  )}
                  status={subject.status}
                  unpublishAction={setSubjectStatusAction.bind(
                    null,
                    course.id,
                    subject.id,
                    ContentStatus.DRAFT,
                  )}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

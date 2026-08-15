import { BookOpenText, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { moveModuleAction, setModuleStatusAction } from "@/app/admin/courses/actions";
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

export const metadata: Metadata = { title: "Módulos" };

type ModulesPageProps = {
  params: Promise<{ courseId: string; subjectId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function ModulesPage({ params, searchParams }: ModulesPageProps) {
  const [{ courseId, subjectId }, { error, success }] = await Promise.all([
    params,
    searchParams,
  ]);
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, courseId },
    select: {
      course: { select: { id: true, title: true } },
      id: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          _count: { select: { lessons: true } },
          description: true,
          id: true,
          order: true,
          slug: true,
          status: true,
          title: true,
          updatedAt: true,
        },
      },
      status: true,
      title: true,
    },
  });
  if (!subject) notFound();
  const base = `/admin/courses/${courseId}/subjects/${subject.id}/modules`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: subject.course.title },
          { label: subject.title },
          { label: "Módulos" },
        ]}
      />
      <AdminPageHeader
        actions={
          <>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={`/admin/courses/${courseId}/subjects/${subject.id}/edit`}
            >
              <Pencil aria-hidden="true" />
              Editar disciplina
            </Link>
            <Link className={buttonVariants()} href={`${base}/new`}>
              <Plus aria-hidden="true" />
              Novo módulo
            </Link>
          </>
        }
        description={`Organize os módulos da disciplina ${subject.title} e acesse suas aulas.`}
        eyebrow={subject.course.title}
        title="Módulos"
      />
      <AdminFeedback error={error} success={success} />

      {subject.modules.length === 0 ? (
        <section className="rounded-lg border bg-background">
          <EmptyState
            action={
              <Link className={buttonVariants()} href={`${base}/new`}>
                <Plus aria-hidden="true" />
                Criar módulo
              </Link>
            }
            description="Adicione o primeiro módulo para estruturar esta disciplina."
            icon={Plus}
            title="Nenhum módulo cadastrado"
          />
        </section>
      ) : (
        <section className="divide-y overflow-hidden rounded-lg border bg-background" aria-label="Lista de módulos">
          {subject.modules.map((module, index) => (
            <article className="space-y-4 p-4 sm:p-5" key={module.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
                    {module.order}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{module.title}</h2>
                      <ContentStatusBadge status={module.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {module.slug} · {module._count.lessons} aula(s)
                    </p>
                    {module.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {module.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <OrderControls
                    downAction={moveModuleAction.bind(
                      null,
                      courseId,
                      subject.id,
                      module.id,
                      "down",
                    )}
                    first={index === 0}
                    last={index === subject.modules.length - 1}
                    upAction={moveModuleAction.bind(
                      null,
                      courseId,
                      subject.id,
                      module.id,
                      "up",
                    )}
                  />
                  <Link
                    className={buttonVariants({ variant: "outline" })}
                    href={`${base}/${module.id}/lessons`}
                  >
                    <BookOpenText aria-hidden="true" />
                    Aulas
                  </Link>
                  <Link
                    aria-label={`Editar ${module.title}`}
                    className={buttonVariants({ size: "icon", variant: "ghost" })}
                    href={`${base}/${module.id}/edit`}
                    title="Editar módulo"
                  >
                    <Pencil aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <ContentStatusActions
                archiveAction={setModuleStatusAction.bind(
                  null,
                  courseId,
                  subject.id,
                  module.id,
                  ContentStatus.ARCHIVED,
                )}
                entityLabel="módulo"
                entityTitle={module.title}
                publishAction={setModuleStatusAction.bind(
                  null,
                  courseId,
                  subject.id,
                  module.id,
                  ContentStatus.PUBLISHED,
                )}
                status={module.status}
                unpublishAction={setModuleStatusAction.bind(
                  null,
                  courseId,
                  subject.id,
                  module.id,
                  ContentStatus.DRAFT,
                )}
              />
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

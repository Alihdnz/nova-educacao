import { Eye, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminFeedback } from "@/components/admin/admin-feedback";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Cursos" };

type CoursesSearchParams = Promise<{
  error?: string;
  success?: string;
}>;

export default async function CoursesPage({ searchParams }: { searchParams: CoursesSearchParams }) {
  const [{ error, success }, courses] = await Promise.all([
    searchParams,
    prisma.course.findMany({
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      select: {
        _count: { select: { subjects: true } },
        id: true,
        slug: true,
        status: true,
        title: true,
        updatedAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { label: "Cursos" },
        ]}
      />
      <AdminPageHeader
        actions={
          <Link className={buttonVariants()} href="/admin/courses/new">
            <Plus aria-hidden="true" />
            Novo curso
          </Link>
        }
        description="Gerencie a estrutura inicial, o status e as disciplinas de cada curso."
        eyebrow="Estrutura educacional"
        title="Cursos"
      />
      <AdminFeedback error={error} success={success} />

      {courses.length === 0 ? (
        <section className="rounded-lg border bg-background">
          <EmptyState
            action={
              <Link className={buttonVariants()} href="/admin/courses/new">
                <Plus aria-hidden="true" />
                Criar primeiro curso
              </Link>
            }
            description="Crie um curso para começar a organizar disciplinas e módulos."
            icon={Plus}
            title="Nenhum curso cadastrado"
          />
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg border bg-background" aria-label="Lista de cursos">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_9rem_8rem] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid">
            <span>Curso</span>
            <span>Slug</span>
            <span>Disciplinas</span>
            <span>Atualização</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y">
            {courses.map((course) => (
              <article
                className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_9rem_8rem] lg:items-center"
                key={course.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">{course.title}</h2>
                    <ContentStatusBadge status={course.status} />
                  </div>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  <span className="font-medium text-foreground lg:hidden">Slug: </span>
                  {course.slug}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground lg:hidden">Disciplinas: </span>
                  {course._count.subjects}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground lg:hidden">Atualização: </span>
                  {course.updatedAt.toLocaleDateString("pt-BR")}
                </p>
                <div className="flex justify-end gap-1">
                  <Link
                    aria-label={`Visualizar estrutura de ${course.title}`}
                    className={buttonVariants({ size: "icon", variant: "ghost" })}
                    href={`/admin/courses/${course.id}`}
                    title="Visualizar estrutura"
                  >
                    <Eye aria-hidden="true" />
                  </Link>
                  <Link
                    aria-label={`Editar ${course.title}`}
                    className={buttonVariants({ size: "icon", variant: "ghost" })}
                    href={`/admin/courses/${course.id}/edit`}
                    title="Editar curso"
                  >
                    <Pencil aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

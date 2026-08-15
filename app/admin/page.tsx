import {
  ArrowRight,
  BookOpen,
  BookPlus,
  CircleCheckBig,
  ClipboardCheck,
  GraduationCap,
  History,
  PlaySquare,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ContentStatus, UserRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Painel geral" };

export default async function AdminPage() {
  const [students, publishedCourses, publishedLessons, assessments, recentCourses] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.STUDENT } }),
    prisma.course.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.lesson.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.assessment.count(),
    prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      select: { _count: { select: { subjects: true } }, id: true, status: true, title: true, updatedAt: true },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-semibold text-primary">Visão geral da plataforma</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Painel geral</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acompanhe a estrutura acadêmica e acesse as ações mais frequentes.</p>
      </header>

      <section aria-label="Resumo da plataforma" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard accent="primary" detail="Contas de estudante" icon={GraduationCap} label="Alunos cadastrados" value={students} />
        <StatCard accent="accent" detail="Disponíveis para matrícula" icon={BookOpen} label="Cursos publicados" value={publishedCourses} />
        <StatCard accent="warning" detail="Conteúdos disponíveis" icon={PlaySquare} label="Aulas publicadas" value={publishedLessons} />
        <StatCard accent="info" detail="Cadastradas na plataforma" icon={ClipboardCheck} label="Avaliações" value={assessments} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-4">
            <div><h2 className="text-lg font-semibold">Cursos atualizados recentemente</h2><p className="mt-1 text-sm text-muted-foreground">Últimas movimentações na estrutura acadêmica.</p></div>
            <Link className={buttonVariants({ variant: "ghost" })} href="/admin/courses">Ver todos<ArrowRight aria-hidden="true" /></Link>
          </CardHeader>
          {recentCourses.length === 0 ? <EmptyState description="As movimentações administrativas aparecerão aqui quando estiverem disponíveis." icon={History} title="Nenhuma atividade registrada" /> : (
            <div className="divide-y">
              {recentCourses.map((course) => (
                <article className="flex items-center gap-4 p-5" key={course.id}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary"><BookOpen aria-hidden="true" className="size-5" /></span>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{course.title}</h3><p className="mt-1 text-xs text-muted-foreground">{course._count.subjects} disciplina(s) • atualizado em {course.updatedAt.toLocaleDateString("pt-BR")}</p></div>
                  <span className={course.status === ContentStatus.PUBLISHED ? "rounded-full bg-accent/12 px-2 py-1 text-xs font-semibold text-[var(--nova-success)]" : "rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"}>{course.status === ContentStatus.PUBLISHED ? "Publicado" : "Rascunho"}</span>
                  <Link aria-label={`Abrir ${course.title}`} className={buttonVariants({ size: "icon", variant: "ghost" })} href={`/admin/courses/${course.id}`}><ArrowRight aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Ações rápidas</h2></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Link className="nova-focus flex min-h-28 flex-col items-center justify-center gap-3 rounded-lg bg-primary/8 p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/12" href="/admin/courses/new"><BookPlus aria-hidden="true" className="size-6" />Novo curso</Link>
            <Link className="nova-focus flex min-h-28 flex-col items-center justify-center gap-3 rounded-lg bg-accent/10 p-4 text-center text-sm font-semibold text-[var(--nova-success)] transition-colors hover:bg-accent/15" href="/admin/courses"><CircleCheckBig aria-hidden="true" className="size-6" />Gerenciar cursos</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

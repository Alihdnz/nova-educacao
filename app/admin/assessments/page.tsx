import { ArrowRight, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Avaliações" };

export default async function AdminAssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      _count: { select: { attempts: true, questions: true } },
      id: true,
      lesson: { select: { id: true, module: { select: { id: true, subject: { select: { course: { select: { id: true, title: true } }, id: true }, }, }, }, title: true } },
      passingPercentage: true,
      status: true,
      title: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail items={[{ href: "/admin", label: "Dashboard" }, { label: "Avaliações" }]} />
      <AdminPageHeader description="Consulte avaliações, tentativas e vínculos; a configuração continua dentro da aula correspondente." eyebrow="Conteúdo avaliativo" title="Avaliações" />
      {assessments.length === 0 ? <section className="nova-surface"><EmptyState description="Crie avaliações a partir de uma aula dentro da estrutura de cursos." icon={ListChecks} title="Nenhuma avaliação cadastrada" /></section> : (
        <section className="nova-surface divide-y overflow-hidden" aria-label="Lista de avaliações">
          {assessments.map((assessment) => {
            const lesson = assessment.lesson;
            const subject = lesson?.module.subject;
            const href = lesson && subject ? `/admin/courses/${subject.course.id}/subjects/${subject.id}/modules/${lesson.module.id}/lessons/${lesson.id}/assessments/${assessment.id}` : null;
            return <article className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" key={assessment.id}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><ContentStatusBadge status={assessment.status} /><span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{assessment._count.questions} questão(ões)</span></div><h2 className="mt-3 font-semibold">{assessment.title}</h2><p className="mt-2 text-xs text-muted-foreground">{lesson && subject ? `${subject.course.title} · ${lesson.title}` : "Avaliação sem aula associada"} · {assessment._count.attempts} tentativa(s) · aprovação em {assessment.passingPercentage.toString()}%</p></div>{href ? <Link className={buttonVariants({ variant: "outline" })} href={href}>Gerenciar<ArrowRight aria-hidden="true" /></Link> : null}</article>;
          })}
        </section>
      )}
    </div>
  );
}

import {
  BookOpen,
  ClipboardCheck,
  History,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { UserRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Administração",
};

const metrics = [
  {
    icon: BookOpen,
    key: "courses",
    label: "Cursos",
    iconClassName: "bg-sky-50 text-sky-700",
  },
  {
    icon: Users,
    key: "students",
    label: "Estudantes",
    iconClassName: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: ClipboardCheck,
    key: "assessments",
    label: "Avaliações",
    iconClassName: "bg-amber-50 text-amber-700",
  },
] as const;

export default async function AdminPage() {
  const [courses, students, assessments] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: UserRole.STUDENT } }),
    prisma.assessment.count(),
  ]);
  const values = { assessments, courses, students };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Visão geral</p>
        <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Acompanhe os principais registros da plataforma.
        </p>
      </header>

      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="mb-3 text-sm font-semibold">
          Resumo da plataforma
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="rounded-lg border bg-background p-5" key={metric.key}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {values[metric.key]}
                    </p>
                  </div>
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${metric.iconClassName}`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border bg-background" aria-labelledby="activity-title">
        <div className="border-b px-5 py-4">
          <h2 id="activity-title" className="text-sm font-semibold">
            Atividade recente
          </h2>
        </div>
        <EmptyState
          description="As movimentações administrativas aparecerão aqui quando estiverem disponíveis."
          icon={History}
          title="Nenhuma atividade registrada"
        />
      </section>
    </div>
  );
}

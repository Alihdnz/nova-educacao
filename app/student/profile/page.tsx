import { BookOpen, CalendarDays, CircleCheckBig, Mail, ShieldCheck, UserRound } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStudentProgressDashboard } from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";
import { calculateAge, GENDER_OPTIONS } from "@/lib/student-registration";

export const metadata: Metadata = { title: "Perfil" };

export default async function StudentProfilePage() {
  const session = await requireRole(UserRole.STUDENT);
  const [dashboard, profile] = await Promise.all([
    getStudentProgressDashboard(session.user.id),
    prisma.user.findUnique({
      select: { birthDate: true, gender: true },
      where: { id: session.user.id },
    }),
  ]);
  const { overall } = dashboard;
  const gender = GENDER_OPTIONS.find((option) => option.value === profile?.gender)?.label;
  const birthDate = profile?.birthDate
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(profile.birthDate)
    : null;

  return (
    <Container className="max-w-[96rem] space-y-7 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Início" }, { label: "Perfil" }]} />
      <header><p className="text-sm font-semibold text-primary">Sua conta</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Perfil do aluno</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Consulte os dados vinculados ao seu acesso. A edição de perfil não está disponível nesta etapa.</p></header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Dados de acesso</h2></CardHeader>
          <CardContent><div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><UserRound aria-hidden="true" className="size-6" /></span><div><p className="font-semibold">{session.user.name}</p><p className="text-sm text-muted-foreground">Estudante NOVA</p></div></div><dl className="mt-6 divide-y text-sm"><div className="flex items-center gap-3 py-3"><Mail aria-hidden="true" className="size-4 text-muted-foreground" /><dt className="sr-only">Email</dt><dd className="break-all">{session.user.email}</dd></div><div className="flex items-center gap-3 py-3"><ShieldCheck aria-hidden="true" className="size-4 text-muted-foreground" /><dt className="sr-only">Tipo de usuário</dt><dd>Aluno{gender ? ` · ${gender}` : ""}</dd></div>{birthDate && profile?.birthDate ? <div className="flex items-center gap-3 py-3"><CalendarDays aria-hidden="true" className="size-4 text-muted-foreground" /><dt className="sr-only">Data de nascimento</dt><dd>{birthDate} · {calculateAge(profile.birthDate)} anos</dd></div> : null}</dl></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Resumo de aprendizagem</h2></CardHeader>
          <CardContent><dl className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-muted/60 p-4"><BookOpen aria-hidden="true" className="size-5 text-primary" /><dt className="mt-3 text-xs text-muted-foreground">Cursos matriculados</dt><dd className="mt-1 text-2xl font-semibold">{overall.coursesTotal}</dd></div><div className="rounded-lg bg-muted/60 p-4"><CircleCheckBig aria-hidden="true" className="size-5 text-[var(--nova-success)]" /><dt className="mt-3 text-xs text-muted-foreground">Progresso geral</dt><dd className="mt-1 text-2xl font-semibold">{formatPercentage(overall.lessonProgress.percentage)}</dd></div><div className="rounded-lg bg-muted/60 p-4"><dt className="text-xs text-muted-foreground">Aulas concluídas</dt><dd className="mt-1 text-xl font-semibold">{overall.lessonProgress.completed} de {overall.lessonProgress.total}</dd></div><div className="rounded-lg bg-muted/60 p-4"><dt className="text-xs text-muted-foreground">Avaliações realizadas</dt><dd className="mt-1 text-xl font-semibold">{overall.assessmentSummary.performed}</dd></div></dl></CardContent>
        </Card>
      </div>
    </Container>
  );
}

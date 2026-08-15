import { ArrowRight, CheckCircle2, ClipboardCheck, Clock3, FileQuestion, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { AttemptStatus, UserRole } from "@/lib/generated/prisma/client";
import { getStudentExercises } from "@/lib/student-exercises";
import { formatPercentage } from "@/lib/student-progress-calculation";

export const metadata: Metadata = { title: "Exercícios e avaliações" };

export default async function StudentExercisesPage() {
  const session = await requireRole(UserRole.STUDENT);
  const exercises = await getStudentExercises(session.user.id);

  return (
    <Container className="max-w-[96rem] space-y-7 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Início" }, { label: "Exercícios" }]} />
      <header><p className="text-sm font-semibold text-primary">Pratique e avalie</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Exercícios e avaliações</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Avaliações disponíveis nos cursos em que você está matriculado, com acesso aos resultados já concluídos.</p></header>
      {exercises.length === 0 ? <Card><EmptyState description="As avaliações publicadas dos seus cursos aparecerão nesta página." icon={ClipboardCheck} title="Nenhuma avaliação disponível" /></Card> : (
        <section className="nova-surface divide-y overflow-hidden" aria-label="Avaliações disponíveis">
          {exercises.map((exercise) => {
            const submitted = exercise.attempt?.status === AttemptStatus.SUBMITTED;
            const inProgress = exercise.attempt?.status === AttemptStatus.IN_PROGRESS;
            return <article className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" key={`${exercise.courseTitle}-${exercise.title}-${exercise.href}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><FileQuestion aria-hidden="true" className="size-5 text-primary" /><h2 className="font-semibold">{exercise.title}</h2>{submitted ? <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-1 text-xs font-semibold text-[var(--nova-success)]"><CheckCircle2 aria-hidden="true" className="size-3.5" />Concluída</span> : inProgress ? <span className="rounded-full bg-[var(--nova-warning)]/10 px-2 py-1 text-xs font-semibold text-[var(--nova-warning)]">Em andamento</span> : null}</div><p className="mt-1 text-xs text-muted-foreground">{exercise.courseTitle} · {exercise.subjectTitle} · {exercise.moduleTitle} · {exercise.lessonTitle}</p>{exercise.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{exercise.description}</p> : null}<div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{exercise.questionCount} questão(ões)</span>{exercise.timeLimitMinutes ? <span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" />{exercise.timeLimitMinutes} min</span> : null}{submitted ? <span>Resultado: {formatPercentage(exercise.attempt?.percentage ?? null)}</span> : null}</div></div><Link className={buttonVariants({ variant: submitted ? "outline" : "default" })} href={exercise.href}>{submitted ? "Ver resultado" : inProgress ? "Continuar avaliação" : "Abrir avaliação"}{inProgress ? <PlayCircle aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}</Link></article>;
          })}
        </section>
      )}
    </Container>
  );
}

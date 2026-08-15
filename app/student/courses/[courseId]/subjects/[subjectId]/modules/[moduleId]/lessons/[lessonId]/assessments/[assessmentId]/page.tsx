import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  History,
  ListChecks,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  finalizeAssessmentAction,
  saveAssessmentAnswerAction,
  startAssessmentAction,
} from "@/app/student/assessment-actions";
import { Container } from "@/components/layout/container";
import { AssessmentQuestionForm } from "@/components/student/assessment-question-form";
import { AssessmentTimer } from "@/components/student/assessment-timer";
import { FinalizeAssessmentForm } from "@/components/student/finalize-assessment-form";
import { StartAssessmentForm } from "@/components/student/start-assessment-form";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentMutationState } from "@/lib/assessment-mutation-state";
import { requireRole } from "@/lib/auth-guards";
import { AttemptStatus, UserRole } from "@/lib/generated/prisma/client";
import {
  getStudentAssessmentPageData,
  studentAssessmentPath,
  type StudentAssessmentRoute,
} from "@/lib/student-assessment";
import {
  studentCoursePath,
  studentLessonPath,
  studentModulePath,
  studentSubjectPath,
} from "@/lib/student-learning";

export const metadata: Metadata = { title: "Avaliação" };

type PageProps = {
  params: Promise<StudentAssessmentRoute>;
  searchParams: Promise<{ attemptId?: string | string[] }>;
};

function metric(label: string, value: string) {
  return (
    <div className="bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default async function StudentAssessmentPage({
  params,
  searchParams,
}: PageProps) {
  const [route, query, session] = await Promise.all([
    params,
    searchParams,
    requireRole(UserRole.STUDENT),
  ]);
  const attemptId =
    typeof query.attemptId === "string" ? query.attemptId : undefined;
  const data = await getStudentAssessmentPageData(
    session.user.id,
    route,
    attemptId,
  );
  if (!data) notFound();

  const lessonPath = studentLessonPath(
    route.courseId,
    route.subjectId,
    route.moduleId,
    route.lessonId,
  );
  const startAction = startAssessmentAction.bind(null, route);

  return (
    <Container className="max-w-[96rem] py-6 sm:py-8">
      <div className="space-y-8">
        <StudentBreadcrumbs
          items={[
            { href: "/student", label: "Início" },
            {
              href: studentCoursePath(route.courseId),
              label: data.courseTitle,
            },
            {
              href: studentSubjectPath(route.courseId, route.subjectId),
              label: data.subjectTitle,
            },
            {
              href: studentModulePath(
                route.courseId,
                route.subjectId,
                route.moduleId,
              ),
              label: data.moduleTitle,
            },
            { href: lessonPath, label: data.lessonTitle },
            { label: data.assessment.title },
          ]}
        />

        {data.kind === "overview" ? (
          <AssessmentOverview
            data={data}
            lessonPath={lessonPath}
            route={route}
            startAction={startAction}
          />
        ) : data.kind === "execution" ? (
          <AssessmentExecution data={data} route={route} />
        ) : data.kind === "result" ? (
          <AssessmentResult
            data={data}
            lessonPath={lessonPath}
            startAction={startAction}
          />
        ) : (
          <AssessmentUnavailable
            abandoned={data.kind === "abandoned"}
            lessonPath={lessonPath}
          />
        )}
      </div>
    </Container>
  );
}

type AssessmentPageData = NonNullable<
  Awaited<ReturnType<typeof getStudentAssessmentPageData>>
>;

type StartAction = (
  state: AssessmentMutationState,
  formData: FormData,
) => Promise<AssessmentMutationState>;

function AssessmentOverview({
  data,
  lessonPath,
  route,
  startAction,
}: {
  data: Extract<AssessmentPageData, { kind: "overview" }>;
  lessonPath: string;
  route: StudentAssessmentRoute;
  startAction: StartAction;
}) {
  const activeAttempt = data.attempts.find(
    (attempt) => attempt.status === AttemptStatus.IN_PROGRESS,
  );
  const submittedAttempts = data.attempts.filter(
    (attempt) => attempt.status === AttemptStatus.SUBMITTED,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="border-b pb-8">
        <p className="text-sm font-medium text-muted-foreground">Avaliação</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {data.assessment.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          {data.assessment.description ||
            "Responda às questões e finalize para consultar seu resultado."}
        </p>
      </header>

      <section
        aria-label="Configuração da avaliação"
        className="nova-surface grid gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4"
      >
        {metric("Questões", String(data.questionCount))}
        {metric("Nota máxima", data.assessment.maxScore)}
        {metric("Aprovação", `${data.assessment.passingPercentage}%`)}
        {metric(
          "Tempo",
          data.assessment.timeLimitMinutes
            ? `${data.assessment.timeLimitMinutes} min`
            : "Sem limite",
        )}
      </section>

      <section className="space-y-4" aria-labelledby="assessment-action-title">
        <div>
          <h2 className="text-lg font-semibold" id="assessment-action-title">
            {activeAttempt ? "Tentativa em andamento" : "Iniciar tentativa"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {activeAttempt
              ? "Suas respostas salvas e o tempo original serão mantidos."
              : "Uma nova tentativa será registrada no momento do início."}
          </p>
        </div>
        {data.executable ? (
          activeAttempt ? (
            <Link
              className={buttonVariants()}
              href={studentAssessmentPath(route, activeAttempt.id)}
            >
              <RotateCcw aria-hidden="true" />
              Retomar avaliação
            </Link>
          ) : (
            <StartAssessmentForm action={startAction} />
          )
        ) : (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Esta avaliação precisa ser revisada pelo administrador antes de
            uma nova tentativa.
          </p>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="attempt-history-title">
        <div>
          <h2 className="text-lg font-semibold" id="attempt-history-title">
            Histórico
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tentativas submetidas permanecem disponíveis para consulta.
          </p>
        </div>
        {submittedAttempts.length === 0 ? (
          <p className="border-y py-5 text-sm text-muted-foreground">
            Nenhuma tentativa finalizada.
          </p>
        ) : (
          <div className="nova-surface divide-y overflow-hidden">
            {submittedAttempts.map((attempt) => (
              <article
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={attempt.id}
              >
                <div>
                  <p className="font-medium">Tentativa {attempt.attemptNumber}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {attempt.submittedAt?.toLocaleString("pt-BR") ??
                      "Data indisponível"}
                    {attempt.percentage !== null
                      ? ` · ${attempt.percentage}%`
                      : ""}
                  </p>
                </div>
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  href={`?attemptId=${attempt.id}`}
                >
                  <FileCheck2 aria-hidden="true" />
                  Ver resultado
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link className={buttonVariants({ variant: "ghost" })} href={lessonPath}>
        <ArrowLeft aria-hidden="true" />
        Voltar para a aula
      </Link>
    </div>
  );
}

function AssessmentExecution({
  data,
  route,
}: {
  data: Extract<AssessmentPageData, { kind: "execution" }>;
  route: StudentAssessmentRoute;
}) {
  const answered = data.questions.filter(
    (question) => question.selectedAnswerId !== null,
  ).length;
  const finalizeAction = finalizeAssessmentAction.bind(
    null,
    route,
    data.attempt.id,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Tentativa {data.attempt.attemptNumber}
          </p>
          <p className="text-sm font-medium tabular-nums">
            {answered} de {data.questions.length} respondida(s)
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {data.assessment.title}
        </h1>
        {data.assessment.description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {data.assessment.description}
          </p>
        ) : null}
      </header>

      {data.attempt.expiresAt ? (
        <AssessmentTimer
          action={finalizeAction}
          expiresAt={data.attempt.expiresAt.toISOString()}
          initialSeconds={Math.max(
            0,
            Math.ceil(
              (data.attempt.expiresAt.getTime() - data.loadedAt.getTime()) /
                1_000,
            ),
          )}
        />
      ) : null}

      <section className="space-y-5" aria-label="Questões da avaliação">
        {data.questions.map((question, index) => (
          <article
            className="nova-surface p-4 sm:p-6"
            key={question.id}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Questão {index + 1} de {data.questions.length}
              </p>
              <span className="text-xs text-muted-foreground">
                {question.type === "TRUE_FALSE"
                  ? "Verdadeiro ou falso"
                  : "Escolha única"}
              </span>
            </div>
            <h2 className="mb-5 text-base font-semibold leading-7">
              {question.prompt}
            </h2>
            <AssessmentQuestionForm
              action={saveAssessmentAnswerAction.bind(
                null,
                route,
                data.attempt.id,
                question.id,
              )}
              answers={question.answers}
              disabled={data.expiredAtLoad}
              selectedAnswerId={question.selectedAnswerId}
            />
          </article>
        ))}
      </section>

      <FinalizeAssessmentForm
        action={finalizeAction}
        answered={answered}
        disabled={data.expiredAtLoad}
        total={data.questions.length}
      />
    </div>
  );
}

function AssessmentResult({
  data,
  lessonPath,
  startAction,
}: {
  data: Extract<AssessmentPageData, { kind: "result" }>;
  lessonPath: string;
  startAction: StartAction;
}) {
  const score = data.attempt.score ?? "0";
  const maxScore = data.attempt.maxScore ?? data.assessment.maxScore;
  const percentage =
    data.attempt.percentage ??
    ((Number(score) / Number(maxScore)) * 100).toFixed(2);
  const passingPercentage =
    data.attempt.passingPercentage ?? data.assessment.passingPercentage;
  const passed =
    data.attempt.passed ?? Number(percentage) >= Number(passingPercentage);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="border-b pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          Resultado da tentativa {data.attempt.attemptNumber}
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {data.assessment.title}
        </h1>
        <div
          className={
            passed
              ? "mt-5 inline-flex items-center gap-2 text-base font-semibold text-[var(--nova-success)]"
              : "mt-5 inline-flex items-center gap-2 text-base font-semibold text-destructive"
          }
        >
          {passed ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <XCircle aria-hidden="true" />
          )}
          {passed ? "Aprovado" : "Reprovado"}
        </div>
      </header>

      <section
        aria-label="Resultado da avaliação"
        className="nova-surface grid gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4"
      >
        {metric("Nota", `${score} de ${maxScore}`)}
        {metric("Percentual", `${percentage}%`)}
        {metric(
          "Acertos",
          data.attempt.correctAnswers !== null &&
            data.attempt.totalQuestions !== null
            ? `${data.attempt.correctAnswers} de ${data.attempt.totalQuestions}`
            : "Indisponível",
        )}
        {metric("Aprovação", `${passingPercentage}%`)}
      </section>

      <section className="border-y py-5 text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2">
          <Clock3 aria-hidden="true" className="size-4" />
          Iniciada em {data.attempt.startedAt.toLocaleString("pt-BR")}
        </p>
        <p className="mt-2 inline-flex items-center gap-2">
          <FileCheck2 aria-hidden="true" className="size-4" />
          Finalizada em {data.attempt.submittedAt?.toLocaleString("pt-BR")}
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className={buttonVariants({ variant: "outline" })} href={lessonPath}>
          <ArrowLeft aria-hidden="true" />
          Voltar para a aula
        </Link>
        {data.canTryAgain ? (
          <StartAssessmentForm action={startAction} label="Nova tentativa" />
        ) : null}
      </div>
    </div>
  );
}

function AssessmentUnavailable({
  abandoned,
  lessonPath,
}: {
  abandoned: boolean;
  lessonPath: string;
}) {
  return (
    <section className="mx-auto max-w-3xl border-y py-10 text-center">
      {abandoned ? (
        <History aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
      ) : (
        <ListChecks aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
      )}
      <h1 className="mt-4 text-xl font-semibold">
        {abandoned ? "Tentativa encerrada" : "Avaliação indisponível"}
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {abandoned
          ? "Esta tentativa não pode mais receber respostas."
          : "A configuração ou publicação mudou e precisa ser revisada antes da continuidade."}
      </p>
      <Link
        className={buttonVariants({ className: "mt-5", variant: "outline" })}
        href={lessonPath}
      >
        <ArrowLeft aria-hidden="true" />
        Voltar para a aula
      </Link>
    </section>
  );
}

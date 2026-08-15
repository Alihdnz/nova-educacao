"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AssessmentMutationState } from "@/lib/assessment-mutation-state";
import { calculateAssessmentResult } from "@/lib/assessment-scoring";
import { requireRole } from "@/lib/auth-guards";
import {
  AttemptStatus,
  Prisma,
  UserRole,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  attemptHasExpired,
  enrollmentAccessWhere,
  getExecutableAssessment,
  isExecutableAssessment,
  studentAssessmentPath,
  type StudentAssessmentRoute,
} from "@/lib/student-assessment";
import { studentLessonPath } from "@/lib/student-learning";

function errorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String(error.code)
    : null;
}

function revalidateAssessment(route: StudentAssessmentRoute) {
  revalidatePath(studentAssessmentPath(route));
  revalidatePath(
    studentLessonPath(
      route.courseId,
      route.subjectId,
      route.moduleId,
      route.lessonId,
    ),
  );
}

async function lockAttempt(tx: Prisma.TransactionClient, attemptId: string) {
  await tx.$queryRaw<{ id: string }[]>`
    SELECT "id"
    FROM "Attempt"
    WHERE "id" = ${attemptId}
    FOR UPDATE
  `;
}

async function submitAssessmentAttempt(
  userId: string,
  route: StudentAssessmentRoute,
  attemptId: string,
) {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findFirst({
      where: enrollmentAccessWhere(userId, route.courseId),
      select: { id: true },
    });
    if (!enrollment) return "invalid-access" as const;

    await lockAttempt(tx, attemptId);

    const attempt = await tx.attempt.findFirst({
      where: {
        assessmentId: route.assessmentId,
        enrollmentId: enrollment.id,
        id: attemptId,
      },
      select: {
        answers: { select: { questionId: true, selectedAnswerId: true } },
        startedAt: true,
        status: true,
        timeLimitMinutesSnapshot: true,
      },
    });
    if (!attempt) return "invalid-attempt" as const;
    if (attempt.status === AttemptStatus.SUBMITTED) {
      return "already-submitted" as const;
    }
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return "invalid-status" as const;
    }

    const assessment = await getExecutableAssessment(route, tx);
    if (!isExecutableAssessment(assessment) || !assessment) {
      return "invalid-assessment" as const;
    }

    const result = calculateAssessmentResult(assessment, attempt.answers);
    const submittedAt = new Date();
    const expired = attemptHasExpired(
      attempt.startedAt,
      attempt.timeLimitMinutesSnapshot,
      submittedAt,
    );
    const submitted = await tx.attempt.updateMany({
      where: { id: attemptId, status: AttemptStatus.IN_PROGRESS },
      data: {
        correctAnswers: result.correctAnswers,
        maxScoreSnapshot: result.maxScore,
        passed: result.passed,
        passingPercentageSnapshot: result.passingPercentage,
        percentage: result.percentage,
        score: result.score,
        status: AttemptStatus.SUBMITTED,
        submittedAt,
        totalQuestions: result.totalQuestions,
      },
    });

    if (submitted.count !== 1) return "already-submitted" as const;

    for (const isCorrect of [true, false]) {
      const questionIds = [...result.correctness]
        .filter(([, value]) => value === isCorrect)
        .map(([questionId]) => questionId);
      if (questionIds.length === 0) continue;

      await tx.attemptAnswer.updateMany({
        where: { attemptId, questionId: { in: questionIds } },
        data: { isCorrect },
      });
    }

    return expired ? ("submitted-expired" as const) : ("submitted" as const);
  });
}

export async function startAssessmentAction(
  route: StudentAssessmentRoute,
  _state: AssessmentMutationState,
  _formData: FormData,
): Promise<AssessmentMutationState> {
  void _state;
  void _formData;
  const session = await requireRole(UserRole.STUDENT);

  let attempt:
    | {
        id: string;
        startedAt: Date;
        timeLimitMinutesSnapshot: number | null;
      }
    | null = null;

  for (let retry = 0; retry < 3 && !attempt; retry += 1) {
    try {
      attempt = await prisma.$transaction(
        async (tx) => {
          const enrollment = await tx.enrollment.findFirst({
            where: enrollmentAccessWhere(session.user.id, route.courseId),
            select: { id: true },
          });
          if (!enrollment) return null;

          const assessment = await getExecutableAssessment(route, tx);
          if (!isExecutableAssessment(assessment) || !assessment) return null;

          const currentAttempt = await tx.attempt.findFirst({
            where: {
              assessmentId: route.assessmentId,
              enrollmentId: enrollment.id,
              status: AttemptStatus.IN_PROGRESS,
            },
            select: {
              id: true,
              startedAt: true,
              timeLimitMinutesSnapshot: true,
            },
          });
          if (currentAttempt) return currentAttempt;

          const latestAttempt = await tx.attempt.aggregate({
            where: {
              assessmentId: route.assessmentId,
              enrollmentId: enrollment.id,
            },
            _max: { attemptNumber: true },
          });

          return tx.attempt.create({
            data: {
              assessmentId: route.assessmentId,
              attemptNumber: (latestAttempt._max.attemptNumber ?? 0) + 1,
              enrollmentId: enrollment.id,
              status: AttemptStatus.IN_PROGRESS,
              timeLimitMinutesSnapshot: assessment.timeLimitMinutes,
            },
            select: {
              id: true,
              startedAt: true,
              timeLimitMinutesSnapshot: true,
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      const code = errorCode(error);
      if (code !== "P2002" && code !== "P2034") {
        return {
          message: "Não foi possível iniciar a avaliação. Tente novamente.",
          status: "error",
        };
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: enrollmentAccessWhere(session.user.id, route.courseId),
        select: { id: true },
      });
      if (enrollment) {
        attempt = await prisma.attempt.findFirst({
          where: {
            assessmentId: route.assessmentId,
            enrollmentId: enrollment.id,
            status: AttemptStatus.IN_PROGRESS,
          },
          select: {
            id: true,
            startedAt: true,
            timeLimitMinutesSnapshot: true,
          },
        });
      }
    }
  }

  if (!attempt) {
    return {
      message:
        "A avaliação não está disponível ou possui uma configuração inválida.",
      status: "error",
    };
  }

  if (
    attemptHasExpired(
      attempt.startedAt,
      attempt.timeLimitMinutesSnapshot,
    )
  ) {
    await submitAssessmentAttempt(session.user.id, route, attempt.id);
  }

  revalidateAssessment(route);
  redirect(studentAssessmentPath(route, attempt.id));
}

export async function saveAssessmentAnswerAction(
  route: StudentAssessmentRoute,
  attemptId: string,
  questionId: string,
  _state: AssessmentMutationState,
  formData: FormData,
): Promise<AssessmentMutationState> {
  void _state;
  const session = await requireRole(UserRole.STUDENT);
  const rawAnswerId = formData.get("answerId");
  const answerId = typeof rawAnswerId === "string" ? rawAnswerId : "";

  if (!answerId) {
    return { message: "Selecione uma alternativa válida.", status: "error" };
  }

  const result = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findFirst({
      where: enrollmentAccessWhere(session.user.id, route.courseId),
      select: { id: true },
    });
    if (!enrollment) return "invalid-access" as const;

    await lockAttempt(tx, attemptId);

    const attempt = await tx.attempt.findFirst({
      where: {
        assessmentId: route.assessmentId,
        enrollmentId: enrollment.id,
        id: attemptId,
        status: AttemptStatus.IN_PROGRESS,
      },
      select: { startedAt: true, timeLimitMinutesSnapshot: true },
    });
    if (!attempt) return "invalid-attempt" as const;

    if (
      attemptHasExpired(
        attempt.startedAt,
        attempt.timeLimitMinutesSnapshot,
      )
    ) {
      return "expired" as const;
    }

    const assessment = await getExecutableAssessment(route, tx);
    if (!isExecutableAssessment(assessment) || !assessment) {
      return "invalid-assessment" as const;
    }

    const question = assessment.questions.find(
      (item) => item.question.id === questionId,
    );
    const validAnswer = question?.question.answers.some(
      (answer) => answer.id === answerId,
    );
    if (!question || !validAnswer) return "invalid-answer" as const;

    await tx.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: {
        answeredAt: new Date(),
        isCorrect: null,
        selectedAnswerId: answerId,
      },
      create: {
        attemptId,
        isCorrect: null,
        questionId,
        selectedAnswerId: answerId,
      },
    });

    return "saved" as const;
  });

  if (result === "expired") {
    await submitAssessmentAttempt(session.user.id, route, attemptId);
    revalidateAssessment(route);
    redirect(studentAssessmentPath(route, attemptId));
  }

  if (result !== "saved") {
    return {
      message:
        result === "invalid-answer"
          ? "A alternativa não pertence a esta questão."
          : "Não foi possível salvar esta resposta.",
      status: "error",
    };
  }

  revalidatePath(studentAssessmentPath(route, attemptId));
  return { message: "Resposta salva.", status: "saved" };
}

export async function finalizeAssessmentAction(
  route: StudentAssessmentRoute,
  attemptId: string,
  _state: AssessmentMutationState,
  _formData: FormData,
): Promise<AssessmentMutationState> {
  void _state;
  void _formData;
  const session = await requireRole(UserRole.STUDENT);
  const result = await submitAssessmentAttempt(
    session.user.id,
    route,
    attemptId,
  );

  if (
    result !== "submitted" &&
    result !== "submitted-expired" &&
    result !== "already-submitted"
  ) {
    return {
      message:
        result === "invalid-assessment"
          ? "A configuração da avaliação mudou e precisa ser revisada."
          : "Não foi possível finalizar esta tentativa.",
      status: "error",
    };
  }

  revalidateAssessment(route);
  redirect(studentAssessmentPath(route, attemptId));
}

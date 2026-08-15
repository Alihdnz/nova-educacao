import "server-only";

import { validateQuestionConfiguration } from "@/lib/question-validation";
import {
  AttemptStatus,
  ContentStatus,
  Prisma,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { accessibleEnrollmentStatuses, studentLessonPath } from "@/lib/student-learning";

export type StudentAssessmentRoute = {
  assessmentId: string;
  courseId: string;
  lessonId: string;
  moduleId: string;
  subjectId: string;
};

const executableAssessmentSelect = {
  description: true,
  id: true,
  lesson: {
    select: {
      id: true,
      module: {
        select: {
          id: true,
          subject: {
            select: {
              course: { select: { id: true, title: true } },
              id: true,
              title: true,
            },
          },
          title: true,
        },
      },
      title: true,
    },
  },
  maxScore: true,
  passingPercentage: true,
  questions: {
    orderBy: { order: "asc" as const },
    select: {
      order: true,
      question: {
        select: {
          answers: {
            orderBy: { order: "asc" as const },
            select: { id: true, isCorrect: true, order: true, text: true },
          },
          explanation: true,
          id: true,
          lessonId: true,
          prompt: true,
          status: true,
          type: true,
        },
      },
      weight: true,
    },
  },
  status: true,
  timeLimitMinutes: true,
  title: true,
} satisfies Prisma.AssessmentSelect;

export type ExecutableAssessment = Prisma.AssessmentGetPayload<{
  select: typeof executableAssessmentSelect;
}>;

export function studentAssessmentPath(
  route: StudentAssessmentRoute,
  attemptId?: string,
) {
  const base = `${studentLessonPath(
    route.courseId,
    route.subjectId,
    route.moduleId,
    route.lessonId,
  )}/assessments/${route.assessmentId}`;

  return attemptId ? `${base}?attemptId=${attemptId}` : base;
}

export function assessmentHierarchyWhere(
  route: StudentAssessmentRoute,
  publishedAssessment = false,
) {
  return {
    id: route.assessmentId,
    lessonId: route.lessonId,
    lesson: {
      id: route.lessonId,
      moduleId: route.moduleId,
      module: {
        id: route.moduleId,
        status: ContentStatus.PUBLISHED,
        subjectId: route.subjectId,
        subject: {
          courseId: route.courseId,
          status: ContentStatus.PUBLISHED,
          course: { id: route.courseId, status: ContentStatus.PUBLISHED },
        },
      },
      status: ContentStatus.PUBLISHED,
    },
    status: publishedAssessment ? ContentStatus.PUBLISHED : undefined,
  } satisfies Prisma.AssessmentWhereInput;
}

export function enrollmentAccessWhere(userId: string, courseId: string) {
  return {
    courseId,
    course: { status: ContentStatus.PUBLISHED },
    status: { in: [...accessibleEnrollmentStatuses] },
    userId,
  } satisfies Prisma.EnrollmentWhereInput;
}

export async function getExecutableAssessment(
  route: StudentAssessmentRoute,
  tx: Prisma.TransactionClient | null = null,
) {
  const client = tx ?? prisma;

  return client.assessment.findFirst({
    where: assessmentHierarchyWhere(route, true),
    select: executableAssessmentSelect,
  });
}

export function isExecutableAssessment(
  assessment: ExecutableAssessment | null,
) {
  if (!assessment || !assessment.lesson || assessment.questions.length === 0) {
    return false;
  }

  if (
    assessment.maxScore.lessThanOrEqualTo(0) ||
    assessment.passingPercentage.lessThan(0) ||
    assessment.passingPercentage.greaterThan(100) ||
    (assessment.timeLimitMinutes !== null &&
      (assessment.timeLimitMinutes < 1 || assessment.timeLimitMinutes > 1_440))
  ) {
    return false;
  }

  const validQuestions = assessment.questions.every(
    ({ question, weight }) =>
      question.lessonId === assessment.lesson?.id &&
      question.status === ContentStatus.PUBLISHED &&
      weight.greaterThan(0) &&
      validateQuestionConfiguration({
        answers: question.answers,
        explanation: question.explanation,
        prompt: question.prompt,
        type: question.type,
      }),
  );
  const totalWeight = assessment.questions.reduce(
    (total, item) => total.plus(item.weight),
    new Prisma.Decimal(0),
  );

  return validQuestions && totalWeight.equals(assessment.maxScore);
}

export function attemptExpiration(
  startedAt: Date,
  timeLimitMinutes: number | null,
) {
  return timeLimitMinutes === null
    ? null
    : new Date(startedAt.getTime() + timeLimitMinutes * 60_000);
}

export function attemptHasExpired(
  startedAt: Date,
  timeLimitMinutes: number | null,
  now = new Date(),
) {
  const expiration = attemptExpiration(startedAt, timeLimitMinutes);
  return expiration !== null && expiration.getTime() <= now.getTime();
}

function publicResult(attempt: {
  attemptNumber: number;
  correctAnswers: number | null;
  id: string;
  maxScoreSnapshot: Prisma.Decimal | null;
  passed: boolean | null;
  passingPercentageSnapshot: Prisma.Decimal | null;
  percentage: Prisma.Decimal | null;
  score: Prisma.Decimal | null;
  startedAt: Date;
  status: AttemptStatus;
  submittedAt: Date | null;
  totalQuestions: number | null;
}) {
  return {
    attemptNumber: attempt.attemptNumber,
    correctAnswers: attempt.correctAnswers,
    id: attempt.id,
    maxScore: attempt.maxScoreSnapshot?.toString() ?? null,
    passed: attempt.passed,
    passingPercentage: attempt.passingPercentageSnapshot?.toString() ?? null,
    percentage: attempt.percentage?.toString() ?? null,
    score: attempt.score?.toString() ?? null,
    startedAt: attempt.startedAt,
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    totalQuestions: attempt.totalQuestions,
  };
}

const attemptResultSelect = {
  attemptNumber: true,
  correctAnswers: true,
  id: true,
  maxScoreSnapshot: true,
  passed: true,
  passingPercentageSnapshot: true,
  percentage: true,
  score: true,
  startedAt: true,
  status: true,
  submittedAt: true,
  totalQuestions: true,
} satisfies Prisma.AttemptSelect;

export async function getStudentAssessmentPageData(
  userId: string,
  route: StudentAssessmentRoute,
  attemptId?: string,
) {
  const enrollment = await prisma.enrollment.findFirst({
    where: enrollmentAccessWhere(userId, route.courseId),
    select: { id: true },
  });
  if (!enrollment) return null;

  const assessment = await prisma.assessment.findFirst({
    where: assessmentHierarchyWhere(route),
    select: {
      description: true,
      id: true,
      lesson: {
        select: {
          module: {
            select: {
              subject: {
                select: {
                  course: { select: { title: true } },
                  title: true,
                },
              },
              title: true,
            },
          },
          title: true,
        },
      },
      maxScore: true,
      passingPercentage: true,
      status: true,
      timeLimitMinutes: true,
      title: true,
    },
  });
  if (!assessment || !assessment.lesson) return null;

  const context = {
    assessment: {
      description: assessment.description,
      id: assessment.id,
      maxScore: assessment.maxScore.toString(),
      passingPercentage: assessment.passingPercentage.toString(),
      status: assessment.status,
      timeLimitMinutes: assessment.timeLimitMinutes,
      title: assessment.title,
    },
    courseTitle: assessment.lesson.module.subject.course.title,
    lessonTitle: assessment.lesson.title,
    moduleTitle: assessment.lesson.module.title,
    subjectTitle: assessment.lesson.module.subject.title,
  };

  if (!attemptId) {
    if (assessment.status !== ContentStatus.PUBLISHED) return null;

    const [executable, attempts] = await Promise.all([
      getExecutableAssessment(route),
      prisma.attempt.findMany({
        where: { assessmentId: route.assessmentId, enrollmentId: enrollment.id },
        orderBy: { attemptNumber: "desc" },
        select: attemptResultSelect,
      }),
    ]);

    return {
      ...context,
      attempts: attempts.map(publicResult),
      executable: isExecutableAssessment(executable),
      kind: "overview" as const,
      questionCount: executable?.questions.length ?? 0,
    };
  }

  const attempt = await prisma.attempt.findFirst({
    where: {
      assessmentId: route.assessmentId,
      enrollmentId: enrollment.id,
      id: attemptId,
    },
    select: {
      ...attemptResultSelect,
      answers: { select: { questionId: true, selectedAnswerId: true } },
      timeLimitMinutesSnapshot: true,
    },
  });
  if (!attempt) return null;

  if (attempt.status === AttemptStatus.SUBMITTED) {
    return {
      ...context,
      attempt: publicResult(attempt),
      canTryAgain: assessment.status === ContentStatus.PUBLISHED,
      kind: "result" as const,
    };
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return { ...context, attempt: publicResult(attempt), kind: "abandoned" as const };
  }

  const executable = await getExecutableAssessment(route);
  if (!isExecutableAssessment(executable) || !executable) {
    return { ...context, kind: "unavailable" as const };
  }

  const selectedByQuestion = new Map(
    attempt.answers.map((answer) => [answer.questionId, answer.selectedAnswerId]),
  );
  const expiresAt = attemptExpiration(
    attempt.startedAt,
    attempt.timeLimitMinutesSnapshot,
  );
  const loadedAt = new Date();

  return {
    ...context,
    attempt: {
      attemptNumber: attempt.attemptNumber,
      expiresAt,
      id: attempt.id,
      startedAt: attempt.startedAt,
    },
    expiredAtLoad:
      expiresAt !== null && expiresAt.getTime() <= loadedAt.getTime(),
    kind: "execution" as const,
    loadedAt,
    questions: executable.questions.map((item) => ({
      answers: item.question.answers.map((answer) => ({
        id: answer.id,
        order: answer.order,
        text: answer.text,
      })),
      id: item.question.id,
      order: item.order,
      prompt: item.question.prompt,
      selectedAnswerId: selectedByQuestion.get(item.question.id) ?? null,
      type: item.question.type,
    })),
  };
}

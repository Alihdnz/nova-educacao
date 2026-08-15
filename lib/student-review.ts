import "server-only";

import {
  AttemptStatus,
  ContentStatus,
  ProgressStatus,
  QuestionDifficulty,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { studentAssessmentPath } from "@/lib/student-assessment";
import { accessibleEnrollmentStatuses } from "@/lib/student-learning";
import { REVIEW_MINIMUM_RESPONSES, reviewPerformance } from "@/lib/student-review-calculation";

// Three responses prevent a single answer from creating a strong recommendation.
export const MIN_RESPONSES_FOR_CLASSIFICATION = REVIEW_MINIMUM_RESPONSES;

export type PerformanceKey = "EXCELLENT" | "GOOD" | "ATTENTION" | "REVIEW" | "INSUFFICIENT";

export type PerformanceClassification = {
  key: PerformanceKey;
  label: string;
};

export function classifyPerformance(responses: number, accuracy: number): PerformanceClassification {
  const key = reviewPerformance(responses, accuracy);
  const labels: Record<PerformanceKey, string> = {
    ATTENTION: "Atenção",
    EXCELLENT: "Excelente",
    GOOD: "Bom",
    INSUFFICIENT: "Dados insuficientes",
    REVIEW: "Revisão recomendada",
  };
  return { key, label: labels[key] };
}

type MutableMetric = {
  correct: number;
  errors: number;
  id: string;
  label: string;
  latestErrorAt: Date | null;
  responses: number;
};

export type ReviewMetric = MutableMetric & {
  accuracy: number;
  classification: PerformanceClassification;
};

function addMetric(map: Map<string, MutableMetric>, id: string, label: string, isCorrect: boolean, answeredAt: Date) {
  const metric = map.get(id) ?? { correct: 0, errors: 0, id, label, latestErrorAt: null, responses: 0 };
  metric.responses += 1;
  if (isCorrect) metric.correct += 1;
  else {
    metric.errors += 1;
    if (!metric.latestErrorAt || answeredAt > metric.latestErrorAt) metric.latestErrorAt = answeredAt;
  }
  map.set(id, metric);
}

function finishMetric(metric: MutableMetric): ReviewMetric {
  const accuracy = metric.responses === 0 ? 0 : (metric.correct / metric.responses) * 100;
  return { ...metric, accuracy, classification: classifyPerformance(metric.responses, accuracy) };
}

function sortedMetrics(map: Map<string, MutableMetric>) {
  return [...map.values()].map(finishMetric).sort((left, right) =>
    left.accuracy - right.accuracy || right.responses - left.responses || left.label.localeCompare(right.label, "pt-BR"),
  );
}

const difficultyLabels: Record<QuestionDifficulty, string> = {
  EASY: "Fácil",
  HARD: "Difícil",
  MEDIUM: "Média",
};

export async function getStudentReview(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    where: {
      course: { status: ContentStatus.PUBLISHED },
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: {
      course: {
        select: {
          id: true,
          subjects: {
            orderBy: { order: "asc" },
            where: { status: ContentStatus.PUBLISHED },
            select: {
              id: true,
              modules: {
                orderBy: { order: "asc" },
                where: { status: ContentStatus.PUBLISHED },
                select: {
                  id: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    where: { status: ContentStatus.PUBLISHED },
                    select: {
                      assessments: {
                        orderBy: { title: "asc" },
                        where: { status: ContentStatus.PUBLISHED },
                        select: {
                          id: true,
                          questions: {
                            orderBy: { order: "asc" },
                            where: { question: { status: ContentStatus.PUBLISHED } },
                            select: { question: { select: { difficulty: true, id: true, lessonId: true, prompt: true } } },
                          },
                          title: true,
                        },
                      },
                      id: true,
                      progresses: {
                        where: { enrollment: { userId } },
                        select: { status: true },
                        take: 1,
                      },
                      title: true,
                    },
                  },
                  title: true,
                },
              },
              title: true,
            },
          },
          title: true,
        },
      },
      id: true,
    },
  });

  const candidates = enrollments.flatMap((enrollment) =>
    enrollment.course.subjects.flatMap((subject) =>
      subject.modules.flatMap((module) =>
        module.lessons.flatMap((lesson) =>
          lesson.assessments
            .map((assessment) => ({
              ...assessment,
              questions: assessment.questions.filter(({ question }) => question.lessonId === lesson.id),
            }))
            .filter((assessment) => assessment.questions.length > 0)
            .map((assessment) => ({
              assessmentId: assessment.id,
              assessmentTitle: assessment.title,
              courseId: enrollment.course.id,
              courseTitle: enrollment.course.title,
              difficulties: new Set(assessment.questions.map(({ question }) => question.difficulty)),
              enrollmentId: enrollment.id,
              href: studentAssessmentPath({
                assessmentId: assessment.id,
                courseId: enrollment.course.id,
                lessonId: lesson.id,
                moduleId: module.id,
                subjectId: subject.id,
              }),
              incomplete: lesson.progresses[0]?.status !== ProgressStatus.COMPLETED,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              moduleId: module.id,
              moduleTitle: module.title,
              questionCount: assessment.questions.length,
              questions: assessment.questions.map(({ question }) => question),
              subjectId: subject.id,
              subjectTitle: subject.title,
            })),
        ),
      ),
    ),
  );

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const assessmentIds = new Set(candidates.map((candidate) => candidate.assessmentId));
  const questionContext = new Map(candidates.flatMap((candidate) => candidate.questions.map((question) => [question.id, {
    ...question,
    courseId: candidate.courseId,
    courseTitle: candidate.courseTitle,
    lessonId: candidate.lessonId,
    lessonTitle: candidate.lessonTitle,
    moduleId: candidate.moduleId,
    moduleTitle: candidate.moduleTitle,
    subjectId: candidate.subjectId,
    subjectTitle: candidate.subjectTitle,
  }] as const)));

  const attempts = enrollmentIds.length === 0 ? [] : await prisma.attempt.findMany({
    orderBy: { submittedAt: "desc" },
    where: {
      assessmentId: { in: [...assessmentIds] },
      enrollmentId: { in: enrollmentIds },
      enrollment: { userId },
      status: AttemptStatus.SUBMITTED,
    },
    select: {
      answers: { select: { answeredAt: true, isCorrect: true, questionId: true } },
      assessmentId: true,
      id: true,
      submittedAt: true,
    },
  });

  const questionMetrics = new Map<string, MutableMetric>();
  const subjectMetrics = new Map<string, MutableMetric>();
  const moduleMetrics = new Map<string, MutableMetric>();
  const lessonMetrics = new Map<string, MutableMetric>();
  const difficultyMetrics = new Map<string, MutableMetric>();

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const context = questionContext.get(answer.questionId);
      if (!context || answer.isCorrect === null) continue;
      addMetric(questionMetrics, context.id, context.prompt, answer.isCorrect, answer.answeredAt);
      addMetric(subjectMetrics, context.subjectId, context.subjectTitle, answer.isCorrect, answer.answeredAt);
      addMetric(moduleMetrics, context.moduleId, context.moduleTitle, answer.isCorrect, answer.answeredAt);
      addMetric(lessonMetrics, context.lessonId, context.lessonTitle, answer.isCorrect, answer.answeredAt);
      addMetric(difficultyMetrics, context.difficulty, difficultyLabels[context.difficulty], answer.isCorrect, answer.answeredAt);
    }
  }

  const questions = sortedMetrics(questionMetrics);
  const subjects = sortedMetrics(subjectMetrics);
  const modules = sortedMetrics(moduleMetrics);
  const lessons = sortedMetrics(lessonMetrics);
  const difficulties = sortedMetrics(difficultyMetrics);
  const total = questions.reduce((summary, item) => ({
    correct: summary.correct + item.correct,
    errors: summary.errors + item.errors,
    responses: summary.responses + item.responses,
  }), { correct: 0, errors: 0, responses: 0 });
  const overallAccuracy = total.responses === 0 ? 0 : (total.correct / total.responses) * 100;
  const lessonById = new Map(lessons.map((metric) => [metric.id, metric]));
  const dominantErrorDifficulty = difficulties
    .filter((metric) => metric.errors > 0)
    .sort((left, right) => right.errors - left.errors || left.accuracy - right.accuracy)[0];

  const recommendations = candidates.map((candidate) => {
    const performance = lessonById.get(candidate.lessonId) ?? null;
    const hasSimilarDifficulty = dominantErrorDifficulty
      ? candidate.difficulties.has(dominantErrorDifficulty.id as QuestionDifficulty)
      : false;
    const recentError = performance?.latestErrorAt ?? null;
    const accuracyPriority = performance && performance.responses >= MIN_RESPONSES_FOR_CLASSIFICATION
      ? 100 - performance.accuracy
      : 0;
    const score = accuracyPriority * 100 + (recentError ? recentError.getTime() / 1e11 : 0) + (hasSimilarDifficulty ? 8 : 0) + (candidate.incomplete ? 4 : 0);
    let reason = "Conteúdo disponível para consolidar sua aprendizagem.";
    if (performance?.classification.key === "REVIEW") reason = `Aproveitamento de ${performance.accuracy.toFixed(0)}% nesta aula.`;
    else if (performance?.classification.key === "ATTENTION") reason = `Esta aula pede atenção: ${performance.accuracy.toFixed(0)}% de aproveitamento.`;
    else if (recentError) reason = "Há um erro recente relacionado a este conteúdo.";
    else if (candidate.incomplete) reason = "Conteúdo ainda não concluído no seu percurso.";
    else if (total.responses === 0) reason = "Comece por uma avaliação do seu curso.";
    return { ...candidate, performance, reason, score };
  }).sort((left, right) => right.score - left.score || left.assessmentTitle.localeCompare(right.assessmentTitle, "pt-BR"));

  return {
    attemptsCount: attempts.length,
    difficulties,
    lessons,
    modules,
    overall: {
      ...total,
      accuracy: overallAccuracy,
      classification: classifyPerformance(total.responses, overallAccuracy),
    },
    questions,
    recommendations: recommendations.slice(0, 6),
    subjects,
  };
}

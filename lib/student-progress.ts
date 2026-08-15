import "server-only";

import {
  AttemptStatus,
  ContentStatus,
  EnrollmentStatus,
  Prisma,
  ProgressStatus,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { studentAssessmentPath } from "@/lib/student-assessment";
import {
  answerStats,
  averagePercentage,
  completionStats,
  ratioPercentage,
  type CompletionStats,
} from "@/lib/student-progress-calculation";
import {
  accessibleEnrollmentStatuses,
  studentLessonPath,
} from "@/lib/student-learning";

const studentProgressEnrollmentSelect = {
  completedAt: true,
  course: {
    select: {
      coverImageUrl: true,
      description: true,
      id: true,
      subjects: {
        orderBy: { order: "asc" as const },
        where: { status: ContentStatus.PUBLISHED },
        select: {
          description: true,
          id: true,
          modules: {
            orderBy: { order: "asc" as const },
            where: { status: ContentStatus.PUBLISHED },
            select: {
              description: true,
              id: true,
              lessons: {
                orderBy: { order: "asc" as const },
                where: { status: ContentStatus.PUBLISHED },
                select: {
                  assessments: {
                    orderBy: { title: "asc" as const },
                    where: { status: ContentStatus.PUBLISHED },
                    select: { id: true, title: true },
                  },
                  description: true,
                  id: true,
                  order: true,
                  title: true,
                },
              },
              order: true,
              title: true,
            },
          },
          order: true,
          title: true,
        },
      },
      title: true,
    },
  },
  courseId: true,
  enrolledAt: true,
  id: true,
  progresses: {
    select: {
      completedAt: true,
      lessonId: true,
      startedAt: true,
      status: true,
    },
  },
  status: true,
  attempts: {
    orderBy: [{ submittedAt: "desc" as const }, { attemptNumber: "desc" as const }],
    where: { status: AttemptStatus.SUBMITTED },
    select: {
      answers: { select: { isCorrect: true } },
      assessment: {
        select: {
          id: true,
          lesson: {
            select: {
              id: true,
              module: {
                select: {
                  id: true,
                  status: true,
                  subject: {
                    select: {
                      courseId: true,
                      id: true,
                      status: true,
                    },
                  },
                },
              },
              status: true,
            },
          },
          status: true,
          title: true,
        },
      },
      attemptNumber: true,
      correctAnswers: true,
      id: true,
      maxScoreSnapshot: true,
      passed: true,
      percentage: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      totalQuestions: true,
    },
  },
} satisfies Prisma.EnrollmentSelect;

type ProgressEnrollment = Prisma.EnrollmentGetPayload<{
  select: typeof studentProgressEnrollmentSelect;
}>;

export type StudentLessonProgress = {
  completedAt: Date | null;
  description: string | null;
  href: string;
  id: string;
  order: number;
  status: ProgressStatus;
  title: string;
};

export type StudentAttemptProgress = {
  answeredQuestions: number;
  attemptNumber: number;
  correctQuestions: number;
  id: string;
  maxScore: string | null;
  passed: boolean | null;
  percentage: number | null;
  score: string | null;
  startedAt: Date;
  submittedAt: Date | null;
  totalQuestions: number | null;
};

export type StudentAssessmentProgress = {
  assessmentId: string;
  attemptCount: number;
  attempts: StudentAttemptProgress[];
  bestAttempt: StudentAttemptProgress | null;
  courseId: string;
  courseTitle: string;
  href: string | null;
  latestAttempt: StudentAttemptProgress;
  lessonId: string | null;
  moduleId: string | null;
  subjectId: string | null;
  title: string;
};

export type StudentAssessmentSummary = {
  accuracy: number;
  answeredQuestions: number;
  attempts: number;
  available: number;
  averagePercentage: number | null;
  correctQuestions: number;
  incorrectQuestions: number;
  performed: number;
};

export type StudentModuleProgress = {
  assessments: StudentAssessmentProgress[];
  assessmentSummary: StudentAssessmentSummary;
  description: string | null;
  id: string;
  lessons: StudentLessonProgress[];
  lessonProgress: CompletionStats;
  nextLesson: StudentLessonProgress | null;
  order: number;
  title: string;
};

export type StudentSubjectProgress = {
  assessments: StudentAssessmentProgress[];
  assessmentSummary: StudentAssessmentSummary;
  description: string | null;
  id: string;
  lessonProgress: CompletionStats;
  modules: StudentModuleProgress[];
  modulesCompleted: number;
  order: number;
  title: string;
};

export type StudentCourseProgress = {
  assessments: StudentAssessmentProgress[];
  assessmentSummary: StudentAssessmentSummary;
  completedAt: Date | null;
  continuation: StudentLessonProgress | null;
  course: {
    coverImageUrl: string | null;
    description: string | null;
    id: string;
    title: string;
  };
  enrolledAt: Date;
  enrollmentId: string;
  isCompleted: boolean;
  lessonProgress: CompletionStats;
  modulesCompleted: number;
  modulesTotal: number;
  status: EnrollmentStatus;
  subjects: StudentSubjectProgress[];
  subjectsCompleted: number;
};

export type StudentOverallProgress = {
  assessmentSummary: StudentAssessmentSummary;
  coursesCompleted: number;
  coursesInProgress: number;
  coursesTotal: number;
  lessonProgress: CompletionStats;
  modulesCompleted: number;
  modulesTotal: number;
  subjectsCompleted: number;
  subjectsTotal: number;
};

export type StudentProgressDashboard = {
  assessments: StudentAssessmentProgress[];
  continuation: {
    courseId: string;
    courseTitle: string;
    lesson: StudentLessonProgress;
  } | null;
  courses: StudentCourseProgress[];
  overall: StudentOverallProgress;
};

function assessmentSummary(
  assessments: StudentAssessmentProgress[],
  available: number,
): StudentAssessmentSummary {
  const attempts = assessments.flatMap((assessment) => assessment.attempts);
  const percentages = attempts.flatMap((attempt) =>
    attempt.percentage === null ? [] : [attempt.percentage],
  );
  const answeredQuestions = attempts.reduce(
    (total, attempt) => total + attempt.answeredQuestions,
    0,
  );
  const correctQuestions = attempts.reduce(
    (total, attempt) => total + attempt.correctQuestions,
    0,
  );
  const incorrectQuestions = Math.max(
    0,
    answeredQuestions - correctQuestions,
  );

  return {
    accuracy: ratioPercentage(correctQuestions, answeredQuestions),
    answeredQuestions,
    attempts: attempts.length,
    available,
    averagePercentage: averagePercentage(percentages),
    correctQuestions,
    incorrectQuestions,
    performed: assessments.length,
  };
}

function buildAssessmentProgress(
  enrollment: ProgressEnrollment,
  courseTitle: string,
) {
  const groups = new Map<string, StudentAssessmentProgress>();

  for (const attempt of enrollment.attempts) {
    const assessment = attempt.assessment;
    const lesson = assessment.lesson;
    const subject = lesson?.module.subject;
    if (!lesson || !subject || subject.courseId !== enrollment.courseId) continue;
    const answers = answerStats(attempt.answers);

    const attemptProgress: StudentAttemptProgress = {
      answeredQuestions: answers.answered,
      attemptNumber: attempt.attemptNumber,
      correctQuestions: answers.correct,
      id: attempt.id,
      maxScore: attempt.maxScoreSnapshot?.toString() ?? null,
      passed: attempt.passed,
      percentage: attempt.percentage === null ? null : Number(attempt.percentage),
      score: attempt.score?.toString() ?? null,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      totalQuestions: attempt.totalQuestions,
    };
    const routeAvailable =
      lesson.status === ContentStatus.PUBLISHED &&
      lesson.module.status === ContentStatus.PUBLISHED &&
      subject.status === ContentStatus.PUBLISHED;
    const href = routeAvailable
      ? studentAssessmentPath(
          {
            assessmentId: assessment.id,
            courseId: enrollment.courseId,
            lessonId: lesson.id,
            moduleId: lesson.module.id,
            subjectId: subject.id,
          },
          attempt.id,
        )
      : null;
    const existing = groups.get(assessment.id);

    if (existing) {
      existing.attempts.push(attemptProgress);
      existing.attemptCount += 1;
      const bestPercentage = existing.bestAttempt?.percentage;
      if (
        attemptProgress.percentage !== null &&
        (bestPercentage === null ||
          bestPercentage === undefined ||
          attemptProgress.percentage > bestPercentage)
      ) {
        existing.bestAttempt = attemptProgress;
      }
      continue;
    }

    groups.set(assessment.id, {
      assessmentId: assessment.id,
      attemptCount: 1,
      attempts: [attemptProgress],
      bestAttempt: attemptProgress.percentage === null ? null : attemptProgress,
      courseId: enrollment.courseId,
      courseTitle,
      href,
      latestAttempt: attemptProgress,
      lessonId: lesson.id,
      moduleId: lesson.module.id,
      subjectId: subject.id,
      title: assessment.title,
    });
  }

  return [...groups.values()];
}

function buildCourseProgress(
  enrollment: ProgressEnrollment,
): StudentCourseProgress {
  const progressByLesson = new Map(
    enrollment.progresses.map((progress) => [progress.lessonId, progress]),
  );
  const courseAssessments = buildAssessmentProgress(
    enrollment,
    enrollment.course.title,
  );
  const availableAssessmentIds = new Set<string>();

  const subjects: StudentSubjectProgress[] = enrollment.course.subjects.map(
    (subject) => {
      const modules: StudentModuleProgress[] = subject.modules.map((module) => {
        const lessons: StudentLessonProgress[] = module.lessons.map((lesson) => {
          lesson.assessments.forEach((assessment) =>
            availableAssessmentIds.add(assessment.id),
          );
          const record = progressByLesson.get(lesson.id);

          return {
            completedAt: record?.completedAt ?? null,
            description: lesson.description,
            href: studentLessonPath(
              enrollment.courseId,
              subject.id,
              module.id,
              lesson.id,
            ),
            id: lesson.id,
            order: lesson.order,
            status: record?.status ?? ProgressStatus.NOT_STARTED,
            title: lesson.title,
          };
        });
        const completed = lessons.filter(
          (lesson) => lesson.status === ProgressStatus.COMPLETED,
        ).length;
        const assessments = courseAssessments.filter(
          (assessment) => assessment.moduleId === module.id,
        );
        const available = module.lessons.reduce(
          (total, lesson) => total + lesson.assessments.length,
          0,
        );

        return {
          assessments,
          assessmentSummary: assessmentSummary(assessments, available),
          description: module.description,
          id: module.id,
          lessons,
          lessonProgress: completionStats(completed, lessons.length),
          nextLesson:
            lessons.find(
              (lesson) => lesson.status !== ProgressStatus.COMPLETED,
            ) ?? null,
          order: module.order,
          title: module.title,
        };
      });
      const lessons = modules.flatMap((module) => module.lessons);
      const completed = lessons.filter(
        (lesson) => lesson.status === ProgressStatus.COMPLETED,
      ).length;
      const assessments = courseAssessments.filter(
        (assessment) => assessment.subjectId === subject.id,
      );
      const available = subject.modules.reduce(
        (total, module) =>
          total +
          module.lessons.reduce(
            (lessonTotal, lesson) =>
              lessonTotal + lesson.assessments.length,
            0,
          ),
        0,
      );

      return {
        assessments,
        assessmentSummary: assessmentSummary(assessments, available),
        description: subject.description,
        id: subject.id,
        lessonProgress: completionStats(completed, lessons.length),
        modules,
        modulesCompleted: modules.filter(
          (module) => module.lessonProgress.isCompleted,
        ).length,
        order: subject.order,
        title: subject.title,
      };
    },
  );
  const modules = subjects.flatMap((subject) => subject.modules);
  const lessons = modules.flatMap((module) => module.lessons);
  const completedLessons = lessons.filter(
    (lesson) => lesson.status === ProgressStatus.COMPLETED,
  ).length;
  const lessonProgress = completionStats(completedLessons, lessons.length);

  return {
    assessments: courseAssessments,
    assessmentSummary: assessmentSummary(
      courseAssessments,
      availableAssessmentIds.size,
    ),
    completedAt: enrollment.completedAt,
    continuation:
      lessons.find((lesson) => lesson.status !== ProgressStatus.COMPLETED) ??
      null,
    course: {
      coverImageUrl: enrollment.course.coverImageUrl,
      description: enrollment.course.description,
      id: enrollment.course.id,
      title: enrollment.course.title,
    },
    enrolledAt: enrollment.enrolledAt,
    enrollmentId: enrollment.id,
    isCompleted:
      enrollment.status === EnrollmentStatus.COMPLETED ||
      lessonProgress.isCompleted,
    lessonProgress,
    modulesCompleted: modules.filter(
      (module) => module.lessonProgress.isCompleted,
    ).length,
    modulesTotal: modules.length,
    status: enrollment.status,
    subjects,
    subjectsCompleted: subjects.filter(
      (subject) => subject.lessonProgress.isCompleted,
    ).length,
  };
}

function buildDashboard(
  enrollments: ProgressEnrollment[],
): StudentProgressDashboard {
  const courses = enrollments.map(buildCourseProgress);
  const subjects = courses.flatMap((course) => course.subjects);
  const modules = subjects.flatMap((subject) => subject.modules);
  const lessons = modules.flatMap((module) => module.lessons);
  const assessments = courses
    .flatMap((course) => course.assessments)
    .sort(
      (left, right) =>
        (right.latestAttempt.submittedAt?.getTime() ?? 0) -
        (left.latestAttempt.submittedAt?.getTime() ?? 0),
    );
  const completedLessons = lessons.filter(
    (lesson) => lesson.status === ProgressStatus.COMPLETED,
  ).length;
  const availableAssessments = courses.reduce(
    (total, course) => total + course.assessmentSummary.available,
    0,
  );
  const overallAssessmentSummary = assessmentSummary(
    assessments,
    availableAssessments,
  );
  const continueCourse =
    courses.find((course) => !course.isCompleted && course.continuation) ?? null;

  return {
    assessments,
    continuation:
      continueCourse?.continuation
        ? {
            courseId: continueCourse.course.id,
            courseTitle: continueCourse.course.title,
            lesson: continueCourse.continuation,
          }
        : null,
    courses,
    overall: {
      assessmentSummary: overallAssessmentSummary,
      coursesCompleted: courses.filter((course) => course.isCompleted).length,
      coursesInProgress: courses.filter((course) => !course.isCompleted).length,
      coursesTotal: courses.length,
      lessonProgress: completionStats(completedLessons, lessons.length),
      modulesCompleted: modules.filter(
        (module) => module.lessonProgress.isCompleted,
      ).length,
      modulesTotal: modules.length,
      subjectsCompleted: subjects.filter(
        (subject) => subject.lessonProgress.isCompleted,
      ).length,
      subjectsTotal: subjects.length,
    },
  };
}

export async function getStudentProgressDashboard(
  userId: string,
  courseId?: string,
) {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    where: {
      course: { status: ContentStatus.PUBLISHED },
      courseId,
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: studentProgressEnrollmentSelect,
  });

  return buildDashboard(enrollments);
}

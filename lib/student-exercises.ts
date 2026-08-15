import "server-only";

import { AttemptStatus, ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { studentAssessmentPath } from "@/lib/student-assessment";
import { accessibleEnrollmentStatuses } from "@/lib/student-learning";

export async function getStudentExercises(userId: string) {
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
                          _count: { select: { questions: true } },
                          description: true,
                          id: true,
                          timeLimitMinutes: true,
                          title: true,
                        },
                      },
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
          title: true,
        },
      },
      id: true,
    },
  });

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const attempts = enrollmentIds.length === 0 ? [] : await prisma.attempt.findMany({
    orderBy: [{ startedAt: "desc" }, { attemptNumber: "desc" }],
    where: { enrollmentId: { in: enrollmentIds } },
    select: {
      assessmentId: true,
      attemptNumber: true,
      enrollmentId: true,
      id: true,
      passed: true,
      percentage: true,
      status: true,
      submittedAt: true,
    },
  });
  const latestAttempt = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    const key = `${attempt.enrollmentId}:${attempt.assessmentId}`;
    if (!latestAttempt.has(key)) latestAttempt.set(key, attempt);
  }

  return enrollments.flatMap((enrollment) =>
    enrollment.course.subjects.flatMap((subject) =>
      subject.modules.flatMap((module) =>
        module.lessons.flatMap((lesson) =>
          lesson.assessments.map((assessment) => {
            const attempt = latestAttempt.get(`${enrollment.id}:${assessment.id}`) ?? null;
            const route = {
              assessmentId: assessment.id,
              courseId: enrollment.course.id,
              lessonId: lesson.id,
              moduleId: module.id,
              subjectId: subject.id,
            };

            return {
              attempt: attempt ? {
                attemptNumber: attempt.attemptNumber,
                id: attempt.id,
                passed: attempt.passed,
                percentage: attempt.percentage === null ? null : Number(attempt.percentage),
                status: attempt.status,
                submittedAt: attempt.submittedAt,
              } : null,
              courseTitle: enrollment.course.title,
              description: assessment.description,
              href: studentAssessmentPath(
                route,
                attempt?.status === AttemptStatus.IN_PROGRESS || attempt?.status === AttemptStatus.SUBMITTED
                  ? attempt.id
                  : undefined,
              ),
              lessonTitle: lesson.title,
              moduleTitle: module.title,
              questionCount: assessment._count.questions,
              subjectTitle: subject.title,
              timeLimitMinutes: assessment.timeLimitMinutes,
              title: assessment.title,
            };
          }),
        ),
      ),
    ),
  );
}

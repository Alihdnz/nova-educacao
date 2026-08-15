import {
  ContentStatus,
  EnrollmentStatus,
  ProgressStatus,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const accessibleEnrollmentStatuses = [
  EnrollmentStatus.ACTIVE,
  EnrollmentStatus.COMPLETED,
] as const;

export type StudentLessonSummary = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  order: number;
  subjectId: string;
  subjectTitle: string;
  title: string;
};

export type ProgressRecord = {
  lessonId: string;
  status: ProgressStatus;
};

export function studentCoursePath(courseId: string) {
  return `/student/courses/${courseId}`;
}

export function studentSubjectPath(courseId: string, subjectId: string) {
  return `${studentCoursePath(courseId)}/subjects/${subjectId}`;
}

export function studentModulePath(
  courseId: string,
  subjectId: string,
  moduleId: string,
) {
  return `${studentSubjectPath(courseId, subjectId)}/modules/${moduleId}`;
}

export function studentLessonPath(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
) {
  return `${studentModulePath(courseId, subjectId, moduleId)}/lessons/${lessonId}`;
}

export function progressMap(records: ProgressRecord[]) {
  return new Map(records.map((record) => [record.lessonId, record.status]));
}

export function lessonStatus(
  lessonId: string,
  records: Map<string, ProgressStatus>,
) {
  return records.get(lessonId) ?? ProgressStatus.NOT_STARTED;
}

export function progressSummary(
  lessonIds: string[],
  records: Map<string, ProgressStatus>,
) {
  const total = lessonIds.length;
  const completed = lessonIds.filter(
    (lessonId) => records.get(lessonId) === ProgressStatus.COMPLETED,
  ).length;
  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 10000) / 100;

  return { completed, percentage, total };
}

export function continuationLesson(
  lessons: StudentLessonSummary[],
  records: Map<string, ProgressStatus>,
) {
  return (
    lessons.find(
      (lesson) => records.get(lesson.id) !== ProgressStatus.COMPLETED,
    ) ??
    lessons[0] ??
    null
  );
}

export function lessonHref(courseId: string, lesson: StudentLessonSummary) {
  return studentLessonPath(
    courseId,
    lesson.subjectId,
    lesson.moduleId,
    lesson.id,
  );
}

const publishedLessonWhere = {
  module: {
    is: {
      status: ContentStatus.PUBLISHED,
      subject: {
        is: {
          status: ContentStatus.PUBLISHED,
          course: { is: { status: ContentStatus.PUBLISHED } },
        },
      },
    },
  },
  status: ContentStatus.PUBLISHED,
} as const;

export async function getStudentDashboard(userId: string) {
  return prisma.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    where: {
      course: { status: ContentStatus.PUBLISHED },
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: {
      course: {
        select: {
          coverImageUrl: true,
          description: true,
          id: true,
          subjects: {
            orderBy: { order: "asc" },
            where: { status: ContentStatus.PUBLISHED },
            select: {
              id: true,
              title: true,
              modules: {
                orderBy: { order: "asc" },
                where: { status: ContentStatus.PUBLISHED },
                select: {
                  id: true,
                  title: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    where: { status: ContentStatus.PUBLISHED },
                    select: { id: true, order: true, title: true },
                  },
                },
              },
            },
          },
          title: true,
        },
      },
      id: true,
      progresses: {
        where: { lesson: publishedLessonWhere },
        select: { lessonId: true, status: true },
      },
      status: true,
    },
  });
}

export async function getStudentCourse(userId: string, courseId: string) {
  return prisma.enrollment.findFirst({
    where: {
      courseId,
      course: { status: ContentStatus.PUBLISHED },
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: {
      course: {
        select: {
          coverImageUrl: true,
          description: true,
          id: true,
          subjects: {
            orderBy: { order: "asc" },
            where: { status: ContentStatus.PUBLISHED },
            select: {
              description: true,
              id: true,
              modules: {
                orderBy: { order: "asc" },
                where: { status: ContentStatus.PUBLISHED },
                select: {
                  id: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    where: { status: ContentStatus.PUBLISHED },
                    select: { id: true },
                  },
                },
              },
              order: true,
              title: true,
            },
          },
          title: true,
        },
      },
      progresses: {
        where: {
          lesson: {
            ...publishedLessonWhere,
            module: {
              is: {
                ...publishedLessonWhere.module.is,
                subject: {
                  is: {
                    ...publishedLessonWhere.module.is.subject.is,
                    courseId,
                  },
                },
              },
            },
          },
        },
        select: { lessonId: true, status: true },
      },
      status: true,
    },
  });
}

export async function getStudentSubject(
  userId: string,
  courseId: string,
  subjectId: string,
) {
  return prisma.enrollment.findFirst({
    where: {
      courseId,
      course: {
        status: ContentStatus.PUBLISHED,
        subjects: {
          some: { id: subjectId, status: ContentStatus.PUBLISHED },
        },
      },
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          subjects: {
            where: { id: subjectId, status: ContentStatus.PUBLISHED },
            select: {
              description: true,
              id: true,
              modules: {
                orderBy: { order: "asc" },
                where: { status: ContentStatus.PUBLISHED },
                select: {
                  description: true,
                  id: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    where: { status: ContentStatus.PUBLISHED },
                    select: { id: true },
                  },
                  order: true,
                  title: true,
                },
              },
              order: true,
              title: true,
            },
          },
        },
      },
      progresses: {
        where: {
          lesson: {
            module: { is: { subjectId, status: ContentStatus.PUBLISHED } },
            status: ContentStatus.PUBLISHED,
          },
        },
        select: { lessonId: true, status: true },
      },
      status: true,
    },
  });
}

export async function getStudentModule(
  userId: string,
  courseId: string,
  subjectId: string,
  moduleId: string,
) {
  return prisma.enrollment.findFirst({
    where: {
      courseId,
      course: {
        status: ContentStatus.PUBLISHED,
        subjects: {
          some: {
            id: subjectId,
            status: ContentStatus.PUBLISHED,
            modules: {
              some: { id: moduleId, status: ContentStatus.PUBLISHED },
            },
          },
        },
      },
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          subjects: {
            where: { id: subjectId, status: ContentStatus.PUBLISHED },
            select: {
              id: true,
              modules: {
                where: { id: moduleId, status: ContentStatus.PUBLISHED },
                select: {
                  description: true,
                  id: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    where: { status: ContentStatus.PUBLISHED },
                    select: {
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
              title: true,
            },
          },
        },
      },
      progresses: {
        where: {
          lesson: {
            moduleId,
            status: ContentStatus.PUBLISHED,
          },
        },
        select: { lessonId: true, status: true },
      },
      status: true,
    },
  });
}

export async function getStudentLesson(
  userId: string,
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      course: {
        status: ContentStatus.PUBLISHED,
        subjects: {
          some: {
            id: subjectId,
            status: ContentStatus.PUBLISHED,
            modules: {
              some: {
                id: moduleId,
                status: ContentStatus.PUBLISHED,
                lessons: {
                  some: { id: lessonId, status: ContentStatus.PUBLISHED },
                },
              },
            },
          },
        },
      },
      status: { in: [...accessibleEnrollmentStatuses] },
      userId,
    },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          subjects: {
            where: { id: subjectId, status: ContentStatus.PUBLISHED },
            select: {
              id: true,
              modules: {
                where: { id: moduleId, status: ContentStatus.PUBLISHED },
                select: {
                  id: true,
                  lessons: {
                    where: {
                      id: lessonId,
                      status: ContentStatus.PUBLISHED,
                    },
                    select: {
                      assessments: {
                        orderBy: { updatedAt: "desc" },
                        where: { status: ContentStatus.PUBLISHED },
                        select: {
                          description: true,
                          id: true,
                          maxScore: true,
                          passingPercentage: true,
                          timeLimitMinutes: true,
                          title: true,
                        },
                      },
                      content: true,
                      description: true,
                      id: true,
                      imageUrl: true,
                      order: true,
                      title: true,
                    },
                  },
                  title: true,
                },
              },
              title: true,
            },
          },
        },
      },
      progresses: {
        where: { lessonId },
        select: { lessonId: true, status: true },
      },
    },
  });

  if (!enrollment) return null;

  const navigationCourse = await prisma.course.findFirst({
    where: { id: courseId, status: ContentStatus.PUBLISHED },
    select: {
      subjects: {
        orderBy: { order: "asc" },
        where: { status: ContentStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          modules: {
            orderBy: { order: "asc" },
            where: { status: ContentStatus.PUBLISHED },
            select: {
              id: true,
              title: true,
              lessons: {
                orderBy: { order: "asc" },
                where: { status: ContentStatus.PUBLISHED },
                select: { id: true, order: true, title: true },
              },
            },
          },
        },
      },
    },
  });
  const navigationLessons: StudentLessonSummary[] =
    navigationCourse?.subjects.flatMap((navigationSubject) =>
      navigationSubject.modules.flatMap((navigationModule) =>
        navigationModule.lessons.map((navigationLesson) => ({
          ...navigationLesson,
          moduleId: navigationModule.id,
          moduleTitle: navigationModule.title,
          subjectId: navigationSubject.id,
          subjectTitle: navigationSubject.title,
        })),
      ),
    ) ?? [];

  return { ...enrollment, navigationLessons };
}

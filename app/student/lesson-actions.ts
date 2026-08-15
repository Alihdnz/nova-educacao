"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth-guards";
import {
  ContentStatus,
  EnrollmentStatus,
  ProgressStatus,
  UserRole,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  accessibleEnrollmentStatuses,
  studentCoursePath,
  studentLessonPath,
  studentModulePath,
  studentSubjectPath,
} from "@/lib/student-learning";

export type CompleteLessonState = {
  message?: string;
  status: "error" | "idle" | "success";
};

export async function completeLessonAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  _state: CompleteLessonState,
  _formData: FormData,
): Promise<CompleteLessonState> {
  void _state;
  void _formData;
  const session = await requireRole(UserRole.STUDENT);
  const now = new Date();

  let result:
    | "completed"
    | "already-completed"
    | "course-completed"
    | "invalid-access"
    | null = null;

  for (let retry = 0; retry < 3 && result === null; retry += 1) {
    try {
      result = await prisma.$transaction(
        async (tx) => {
          const enrollment = await tx.enrollment.findFirst({
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
                          some: {
                            id: lessonId,
                            status: ContentStatus.PUBLISHED,
                          },
                        },
                      },
                    },
                  },
                },
              },
              status: { in: [...accessibleEnrollmentStatuses] },
              userId: session.user.id,
            },
            select: {
              completedAt: true,
              id: true,
              progresses: {
                where: { lessonId },
                select: {
                  completedAt: true,
                  startedAt: true,
                  status: true,
                },
              },
              status: true,
            },
          });

          if (!enrollment) return "invalid-access" as const;
          const existingProgress = enrollment.progresses[0];
          const alreadyCompleted =
            existingProgress?.status === ProgressStatus.COMPLETED;

          if (!alreadyCompleted) {
            await tx.progress.upsert({
              where: {
                enrollmentId_lessonId: {
                  enrollmentId: enrollment.id,
                  lessonId,
                },
              },
              update: {
                completedAt: existingProgress?.completedAt ?? now,
                startedAt: existingProgress?.startedAt ?? now,
                status: ProgressStatus.COMPLETED,
              },
              create: {
                completedAt: now,
                enrollmentId: enrollment.id,
                lessonId,
                startedAt: now,
                status: ProgressStatus.COMPLETED,
              },
            });
          }

          const publishedLessonWhere = {
            module: {
              subject: {
                courseId,
                status: ContentStatus.PUBLISHED,
              },
              status: ContentStatus.PUBLISHED,
            },
            status: ContentStatus.PUBLISHED,
          } as const;
          const [publishedLessons, completedLessons] = await Promise.all([
            tx.lesson.count({ where: publishedLessonWhere }),
            tx.progress.count({
              where: {
                enrollmentId: enrollment.id,
                lesson: publishedLessonWhere,
                status: ProgressStatus.COMPLETED,
              },
            }),
          ]);
          const courseCompleted =
            publishedLessons > 0 && completedLessons === publishedLessons;

          if (
            courseCompleted &&
            enrollment.status !== EnrollmentStatus.COMPLETED
          ) {
            await tx.enrollment.update({
              where: { id: enrollment.id },
              data: {
                completedAt: enrollment.completedAt ?? now,
                status: EnrollmentStatus.COMPLETED,
              },
            });
          }

          if (courseCompleted) return "course-completed" as const;
          return alreadyCompleted
            ? ("already-completed" as const)
            : ("completed" as const);
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : null;
      if (code !== "P2034") throw error;
    }
  }

  if (result === null) {
    return {
      message: "Não foi possível registrar a conclusão. Tente novamente.",
      status: "error",
    };
  }

  if (result === "invalid-access") {
    return {
      message: "Esta aula não está disponível para sua matrícula.",
      status: "error",
    };
  }

  const coursePath = studentCoursePath(courseId);
  const subjectPath = studentSubjectPath(courseId, subjectId);
  const modulePath = studentModulePath(courseId, subjectId, moduleId);
  const lessonPath = studentLessonPath(courseId, subjectId, moduleId, lessonId);

  revalidatePath("/student");
  revalidatePath(coursePath);
  revalidatePath(subjectPath);
  revalidatePath(modulePath);
  revalidatePath(lessonPath);

  return {
    message:
      result === "course-completed"
        ? "Aula e curso concluídos."
        : result === "already-completed"
        ? "Esta aula já estava concluída."
        : "Aula marcada como concluída.",
    status: "success",
  };
}

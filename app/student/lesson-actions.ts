"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth-guards";
import {
  ContentStatus,
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

  const result = await prisma.$transaction(async (tx) => {
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
                    some: { id: lessonId, status: ContentStatus.PUBLISHED },
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
        id: true,
        progresses: {
          where: { lessonId },
          select: { completedAt: true, startedAt: true, status: true },
        },
      },
    });

    if (!enrollment) return "invalid-access" as const;
    const existingProgress = enrollment.progresses[0];

    if (existingProgress?.status === ProgressStatus.COMPLETED) {
      return "already-completed" as const;
    }

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

    return "completed" as const;
  });

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
      result === "already-completed"
        ? "Esta aula já estava concluída."
        : "Aula marcada como concluída.",
    status: "success",
  };
}

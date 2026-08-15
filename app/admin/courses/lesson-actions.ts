"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth-guards";
import { ContentStatus, Prisma } from "@/lib/generated/prisma/client";
import type { LessonFormState } from "@/lib/lesson-validation";
import { parseLessonForm } from "@/lib/lesson-validation";
import { prisma } from "@/lib/prisma";

type MoveDirection = "down" | "up";
type TransactionClient = Prisma.TransactionClient;

function lessonBase(courseId: string, subjectId: string, moduleId: string) {
  return `/admin/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/lessons`;
}

function errorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) return String(error.code);
  return null;
}

function lessonFormFailure(error: unknown): LessonFormState {
  if (errorCode(error) === "P2002") {
    return {
      errors: { slug: ["Este slug já está em uso neste módulo."] },
      message: "Não foi possível salvar a aula.",
    };
  }

  return { message: "Não foi possível salvar a aula. Tente novamente." };
}

function statusMessage(status: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "published";
  if (status === ContentStatus.ARCHIVED) return "archived";
  return "unpublished";
}

function revalidateLessons(courseId: string, subjectId: string, moduleId: string, lessonId?: string) {
  const modulesBase = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  const base = lessonBase(courseId, subjectId, moduleId);

  revalidatePath("/admin");
  revalidatePath(modulesBase);
  revalidatePath(base);
  if (lessonId) {
    revalidatePath(`${base}/${lessonId}/edit`);
    revalidatePath(`${base}/${lessonId}/preview`);
  }
}

async function moveLessonToOrder(
  tx: TransactionClient,
  moduleId: string,
  lessonId: string,
  currentOrder: number,
  targetOrder: number,
  temporaryOrder: number,
) {
  const step = targetOrder > currentOrder ? 1 : -1;
  let order = currentOrder;

  while (order !== targetOrder) {
    const nextOrder = order + step;
    const neighbor = await tx.lesson.findUnique({
      where: { moduleId_order: { moduleId, order: nextOrder } },
      select: { id: true },
    });

    if (!neighbor) throw new Error("LESSON_ORDER_INTEGRITY");

    await tx.lesson.update({ where: { id: lessonId }, data: { order: temporaryOrder } });
    await tx.lesson.update({ where: { id: neighbor.id }, data: { order } });
    await tx.lesson.update({ where: { id: lessonId }, data: { order: nextOrder } });
    order = nextOrder;
  }
}

export async function createLessonAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  _state: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();
  const [courseModule, count] = await Promise.all([
    prisma.module.findFirst({
      where: { id: moduleId, subjectId, subject: { courseId } },
      select: { id: true },
    }),
    prisma.lesson.count({
      where: { moduleId, module: { subjectId, subject: { courseId } } },
    }),
  ]);
  if (!courseModule) return { message: "O módulo não pertence à hierarquia informada." };

  const parsed = parseLessonForm(formData, count + 1);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  let lessonId: string;
  try {
    lessonId = await prisma.$transaction(
      async (tx) => {
        const hierarchy = await tx.module.findFirst({
          where: { id: moduleId, subjectId, subject: { courseId } },
          select: { id: true },
        });
        if (!hierarchy) throw new Error("INVALID_HIERARCHY");

        const lesson = await tx.lesson.create({
          data: {
            ...parsed.data,
            moduleId,
            order: count + 1,
            status: ContentStatus.DRAFT,
          },
          select: { id: true },
        });
        await moveLessonToOrder(
          tx,
          moduleId,
          lesson.id,
          count + 1,
          parsed.data.order,
          count + 2,
        );
        return lesson.id;
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return lessonFormFailure(error);
  }

  revalidateLessons(courseId, subjectId, moduleId, lessonId);
  redirect(`${lessonBase(courseId, subjectId, moduleId)}?success=lesson-created`);
}

export async function updateLessonAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  _state: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();
  const [lesson, count] = await Promise.all([
    prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: { subjectId, subject: { courseId } },
      },
      select: { id: true, order: true },
    }),
    prisma.lesson.count({
      where: { moduleId, module: { subjectId, subject: { courseId } } },
    }),
  ]);
  if (!lesson) return { message: "A aula não pertence à hierarquia informada." };

  const parsed = parseLessonForm(formData, count);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    await prisma.$transaction(
      async (tx) => {
        const result = await tx.lesson.updateMany({
          where: {
            id: lessonId,
            moduleId,
            module: { subjectId, subject: { courseId } },
          },
          data: {
            content: parsed.data.content,
            description: parsed.data.description,
            imageUrl: parsed.data.imageUrl,
            slug: parsed.data.slug,
            title: parsed.data.title,
          },
        });
        if (result.count !== 1) throw new Error("INVALID_HIERARCHY");

        await moveLessonToOrder(
          tx,
          moduleId,
          lessonId,
          lesson.order,
          parsed.data.order,
          count + 1,
        );
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return lessonFormFailure(error);
  }

  revalidateLessons(courseId, subjectId, moduleId, lessonId);
  redirect(`${lessonBase(courseId, subjectId, moduleId)}?success=lesson-updated`);
}

export async function setLessonStatusAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  status: ContentStatus,
) {
  await requireAdmin();
  if (!Object.values(ContentStatus).includes(status)) throw new Error("INVALID_STATUS");
  const base = lessonBase(courseId, subjectId, moduleId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      moduleId,
      module: { subjectId, subject: { courseId } },
    },
    select: { content: true },
  });
  if (!lesson) redirect(`${base}?error=invalid-hierarchy`);
  if (status === ContentStatus.PUBLISHED && !lesson.content?.trim()) {
    redirect(`${base}?error=lesson-content-required`);
  }

  const result = await prisma.lesson.updateMany({
    where: {
      id: lessonId,
      moduleId,
      module: { subjectId, subject: { courseId } },
    },
    data: { status },
  });
  if (result.count !== 1) redirect(`${base}?error=invalid-hierarchy`);

  revalidateLessons(courseId, subjectId, moduleId, lessonId);
  redirect(`${base}?success=lesson-${statusMessage(status)}`);
}

export async function moveLessonAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  direction: MoveDirection,
) {
  await requireAdmin();
  if (direction !== "up" && direction !== "down") throw new Error("INVALID_DIRECTION");
  const base = lessonBase(courseId, subjectId, moduleId);
  let moved = false;

  try {
    moved = await prisma.$transaction(
      async (tx) => {
        const [lesson, count] = await Promise.all([
          tx.lesson.findFirst({
            where: {
              id: lessonId,
              moduleId,
              module: { subjectId, subject: { courseId } },
            },
            select: { order: true },
          }),
          tx.lesson.count({
            where: { moduleId, module: { subjectId, subject: { courseId } } },
          }),
        ]);
        if (!lesson) throw new Error("INVALID_HIERARCHY");

        const target = lesson.order + (direction === "up" ? -1 : 1);
        if (target < 1 || target > count) return false;
        await moveLessonToOrder(
          tx,
          moduleId,
          lessonId,
          lesson.order,
          target,
          count + 1,
        );
        return true;
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    redirect(`${base}?error=reorder-failed`);
  }

  revalidateLessons(courseId, subjectId, moduleId, lessonId);
  redirect(`${base}?success=${moved ? "lesson-reordered" : "order-unchanged"}`);
}


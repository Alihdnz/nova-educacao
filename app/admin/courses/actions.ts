"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { StructureFormState, StructureStatus } from "@/lib/course-structure-validation";
import { parseChildForm, parseCourseForm } from "@/lib/course-structure-validation";
import { ContentStatus, Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

type MoveDirection = "down" | "up";
type TransactionClient = Prisma.TransactionClient;

function errorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String(error.code);
  }
  return null;
}

function formFailure(error: unknown, entity: "curso" | "disciplina" | "módulo") {
  if (errorCode(error) === "P2002") {
    return {
      errors: { slug: ["Este slug já está em uso neste contexto."] },
      message: `Não foi possível salvar o ${entity}.`,
    } satisfies StructureFormState;
  }

  return {
    message: `Não foi possível salvar o ${entity}. Tente novamente.`,
  } satisfies StructureFormState;
}

function contentStatus(status: StructureStatus) {
  return status as ContentStatus;
}

function statusMessage(status: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "published";
  if (status === ContentStatus.ARCHIVED) return "archived";
  return "unpublished";
}

function revalidateCourse(courseId?: string, subjectId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  if (courseId) revalidatePath(`/admin/courses/${courseId}`);
  if (courseId && subjectId) {
    revalidatePath(`/admin/courses/${courseId}/subjects/${subjectId}/modules`);
  }
}

async function moveSubjectToOrder(
  tx: TransactionClient,
  courseId: string,
  subjectId: string,
  currentOrder: number,
  targetOrder: number,
  temporaryOrder: number,
) {
  const step = targetOrder > currentOrder ? 1 : -1;
  let order = currentOrder;

  while (order !== targetOrder) {
    const nextOrder = order + step;
    const neighbor = await tx.subject.findUnique({
      where: { courseId_order: { courseId, order: nextOrder } },
      select: { id: true },
    });

    if (!neighbor) throw new Error("SUBJECT_ORDER_INTEGRITY");

    await tx.subject.update({ where: { id: subjectId }, data: { order: temporaryOrder } });
    await tx.subject.update({ where: { id: neighbor.id }, data: { order } });
    await tx.subject.update({ where: { id: subjectId }, data: { order: nextOrder } });
    order = nextOrder;
  }
}

async function moveModuleToOrder(
  tx: TransactionClient,
  subjectId: string,
  moduleId: string,
  currentOrder: number,
  targetOrder: number,
  temporaryOrder: number,
) {
  const step = targetOrder > currentOrder ? 1 : -1;
  let order = currentOrder;

  while (order !== targetOrder) {
    const nextOrder = order + step;
    const neighbor = await tx.module.findUnique({
      where: { subjectId_order: { subjectId, order: nextOrder } },
      select: { id: true },
    });

    if (!neighbor) throw new Error("MODULE_ORDER_INTEGRITY");

    await tx.module.update({ where: { id: moduleId }, data: { order: temporaryOrder } });
    await tx.module.update({ where: { id: neighbor.id }, data: { order } });
    await tx.module.update({ where: { id: moduleId }, data: { order: nextOrder } });
    order = nextOrder;
  }
}

export async function createCourseAction(
  _state: StructureFormState,
  formData: FormData,
): Promise<StructureFormState> {
  await requireAdmin();
  const parsed = parseCourseForm(formData);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  let courseId: string;
  try {
    const course = await prisma.course.create({
      data: { ...parsed.data, status: contentStatus(parsed.data.status) },
      select: { id: true },
    });
    courseId = course.id;
  } catch (error) {
    return formFailure(error, "curso");
  }

  revalidateCourse(courseId);
  redirect(`/admin/courses/${courseId}?success=course-created`);
}

export async function updateCourseAction(
  courseId: string,
  _state: StructureFormState,
  formData: FormData,
): Promise<StructureFormState> {
  await requireAdmin();
  const parsed = parseCourseForm(formData);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { ...parsed.data, status: contentStatus(parsed.data.status) },
    });
  } catch (error) {
    return formFailure(error, "curso");
  }

  revalidateCourse(courseId);
  redirect(`/admin/courses/${courseId}?success=course-updated`);
}

export async function setCourseStatusAction(courseId: string, status: ContentStatus) {
  await requireAdmin();
  if (!Object.values(ContentStatus).includes(status)) throw new Error("INVALID_STATUS");

  try {
    await prisma.course.update({ where: { id: courseId }, data: { status } });
  } catch {
    redirect(`/admin/courses/${courseId}?error=status-update`);
  }

  revalidateCourse(courseId);
  redirect(`/admin/courses/${courseId}?success=course-${statusMessage(status)}`);
}

export async function createSubjectAction(
  courseId: string,
  _state: StructureFormState,
  formData: FormData,
): Promise<StructureFormState> {
  await requireAdmin();
  const [course, count] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    prisma.subject.count({ where: { courseId } }),
  ]);
  if (!course) return { message: "O curso informado não existe." };

  const parsed = parseChildForm(formData, count + 1);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    await prisma.$transaction(
      async (tx) => {
        const subject = await tx.subject.create({
          data: {
            courseId,
            description: parsed.data.description,
            order: count + 1,
            slug: parsed.data.slug,
            status: contentStatus(parsed.data.status),
            title: parsed.data.title,
          },
          select: { id: true },
        });
        await moveSubjectToOrder(
          tx,
          courseId,
          subject.id,
          count + 1,
          parsed.data.order,
          count + 2,
        );
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return formFailure(error, "disciplina");
  }

  revalidateCourse(courseId);
  redirect(`/admin/courses/${courseId}?success=subject-created`);
}

export async function updateSubjectAction(
  courseId: string,
  subjectId: string,
  _state: StructureFormState,
  formData: FormData,
): Promise<StructureFormState> {
  await requireAdmin();
  const [subject, count] = await Promise.all([
    prisma.subject.findFirst({
      where: { id: subjectId, courseId },
      select: { id: true, order: true },
    }),
    prisma.subject.count({ where: { courseId } }),
  ]);
  if (!subject) return { message: "A disciplina não pertence ao curso informado." };

  const parsed = parseChildForm(formData, count);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.subject.update({
          where: { id: subjectId },
          data: {
            description: parsed.data.description,
            slug: parsed.data.slug,
            status: contentStatus(parsed.data.status),
            title: parsed.data.title,
          },
        });
        await moveSubjectToOrder(
          tx,
          courseId,
          subjectId,
          subject.order,
          parsed.data.order,
          count + 1,
        );
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return formFailure(error, "disciplina");
  }

  revalidateCourse(courseId, subjectId);
  redirect(`/admin/courses/${courseId}?success=subject-updated`);
}

export async function setSubjectStatusAction(
  courseId: string,
  subjectId: string,
  status: ContentStatus,
) {
  await requireAdmin();
  if (!Object.values(ContentStatus).includes(status)) throw new Error("INVALID_STATUS");

  const result = await prisma.subject.updateMany({
    where: { id: subjectId, courseId },
    data: { status },
  });
  if (result.count !== 1) redirect(`/admin/courses/${courseId}?error=invalid-hierarchy`);

  revalidateCourse(courseId, subjectId);
  redirect(`/admin/courses/${courseId}?success=subject-${statusMessage(status)}`);
}

export async function moveSubjectAction(
  courseId: string,
  subjectId: string,
  direction: MoveDirection,
) {
  await requireAdmin();
  if (direction !== "up" && direction !== "down") {
    throw new Error("INVALID_DIRECTION");
  }
  let moved = false;

  try {
    moved = await prisma.$transaction(
      async (tx) => {
        const [subject, count] = await Promise.all([
          tx.subject.findFirst({
            where: { id: subjectId, courseId },
            select: { order: true },
          }),
          tx.subject.count({ where: { courseId } }),
        ]);
        if (!subject) throw new Error("INVALID_HIERARCHY");
        const target = subject.order + (direction === "up" ? -1 : 1);
        if (target < 1 || target > count) return false;
        await moveSubjectToOrder(
          tx,
          courseId,
          subjectId,
          subject.order,
          target,
          count + 1,
        );
        return true;
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    redirect(`/admin/courses/${courseId}?error=reorder-failed`);
  }

  revalidateCourse(courseId);
  redirect(`/admin/courses/${courseId}?success=${moved ? "subject-reordered" : "order-unchanged"}`);
}

export async function createModuleAction(
  courseId: string,
  subjectId: string,
  _state: StructureFormState,
  formData: FormData,
): Promise<StructureFormState> {
  await requireAdmin();
  const [subject, count] = await Promise.all([
    prisma.subject.findFirst({
      where: { id: subjectId, courseId },
      select: { id: true },
    }),
    prisma.module.count({ where: { subjectId } }),
  ]);
  if (!subject) return { message: "A disciplina não pertence ao curso informado." };

  const parsed = parseChildForm(formData, count + 1);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    await prisma.$transaction(
      async (tx) => {
        const courseModule = await tx.module.create({
          data: {
            description: parsed.data.description,
            order: count + 1,
            slug: parsed.data.slug,
            status: contentStatus(parsed.data.status),
            subjectId,
            title: parsed.data.title,
          },
          select: { id: true },
        });
        await moveModuleToOrder(
          tx,
          subjectId,
          courseModule.id,
          count + 1,
          parsed.data.order,
          count + 2,
        );
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return formFailure(error, "módulo");
  }

  revalidateCourse(courseId, subjectId);
  redirect(
    `/admin/courses/${courseId}/subjects/${subjectId}/modules?success=module-created`,
  );
}

export async function updateModuleAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  _state: StructureFormState,
  formData: FormData,
): Promise<StructureFormState> {
  await requireAdmin();
  const [module, count] = await Promise.all([
    prisma.module.findFirst({
      where: { id: moduleId, subjectId, subject: { courseId } },
      select: { id: true, order: true },
    }),
    prisma.module.count({ where: { subjectId, subject: { courseId } } }),
  ]);
  if (!module) return { message: "O módulo não pertence à hierarquia informada." };

  const parsed = parseChildForm(formData, count);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.module.update({
          where: { id: moduleId },
          data: {
            description: parsed.data.description,
            slug: parsed.data.slug,
            status: contentStatus(parsed.data.status),
            title: parsed.data.title,
          },
        });
        await moveModuleToOrder(
          tx,
          subjectId,
          moduleId,
          module.order,
          parsed.data.order,
          count + 1,
        );
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return formFailure(error, "módulo");
  }

  revalidateCourse(courseId, subjectId);
  redirect(
    `/admin/courses/${courseId}/subjects/${subjectId}/modules?success=module-updated`,
  );
}

export async function setModuleStatusAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  status: ContentStatus,
) {
  await requireAdmin();
  if (!Object.values(ContentStatus).includes(status)) throw new Error("INVALID_STATUS");

  const result = await prisma.module.updateMany({
    where: { id: moduleId, subjectId, subject: { courseId } },
    data: { status },
  });
  const base = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  if (result.count !== 1) redirect(`${base}?error=invalid-hierarchy`);

  revalidateCourse(courseId, subjectId);
  redirect(`${base}?success=module-${statusMessage(status)}`);
}

export async function moveModuleAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  direction: MoveDirection,
) {
  await requireAdmin();
  if (direction !== "up" && direction !== "down") {
    throw new Error("INVALID_DIRECTION");
  }
  const base = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;
  let moved = false;

  try {
    moved = await prisma.$transaction(
      async (tx) => {
        const [module, count] = await Promise.all([
          tx.module.findFirst({
            where: { id: moduleId, subjectId, subject: { courseId } },
            select: { order: true },
          }),
          tx.module.count({ where: { subjectId, subject: { courseId } } }),
        ]);
        if (!module) throw new Error("INVALID_HIERARCHY");
        const target = module.order + (direction === "up" ? -1 : 1);
        if (target < 1 || target > count) return false;
        await moveModuleToOrder(
          tx,
          subjectId,
          moduleId,
          module.order,
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

  revalidateCourse(courseId, subjectId);
  redirect(`${base}?success=${moved ? "module-reordered" : "order-unchanged"}`);
}

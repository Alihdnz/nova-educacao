"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth-guards";
import {
  ContentStatus,
  Prisma,
  QuestionDifficulty,
  QuestionType,
} from "@/lib/generated/prisma/client";
import type { QuestionFormState } from "@/lib/question-validation";
import { parseQuestionForm, validateQuestionConfiguration } from "@/lib/question-validation";
import { prisma } from "@/lib/prisma";

type MoveDirection = "down" | "up";
type TransactionClient = Prisma.TransactionClient;

function lessonBase(courseId: string, subjectId: string, moduleId: string, lessonId: string) {
  return `/admin/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}`;
}

function questionBase(courseId: string, subjectId: string, moduleId: string, lessonId: string) {
  return `${lessonBase(courseId, subjectId, moduleId, lessonId)}/questions`;
}

function hierarchyWhere(courseId: string, subjectId: string, moduleId: string, lessonId: string) {
  return {
    id: lessonId,
    moduleId,
    module: { subjectId, subject: { courseId } },
  };
}

function questionWhere(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  questionId: string,
) {
  return {
    id: questionId,
    lessonId,
    lesson: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
  };
}

function errorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) return String(error.code);
  return null;
}

function questionFailure(error: unknown): QuestionFormState {
  if (error instanceof Error && error.message === "ANSWER_HAS_ATTEMPTS") {
    return { message: "Alternativas com respostas históricas não podem ser removidas." };
  }
  if (error instanceof Error && error.message === "INVALID_ANSWERS") {
    return { message: "A lista de alternativas não pertence a esta questão." };
  }
  if (errorCode(error) === "P2002") {
    return { message: "Não foi possível salvar por conflito de ordem. Tente novamente." };
  }
  return { message: "Não foi possível salvar a questão. Tente novamente." };
}

function statusMessage(status: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "published";
  if (status === ContentStatus.ARCHIVED) return "archived";
  return "unpublished";
}

function revalidateQuestions(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  questionId?: string,
) {
  const lessons = `/admin/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/lessons`;
  const base = questionBase(courseId, subjectId, moduleId, lessonId);
  revalidatePath(lessons);
  revalidatePath(base);
  revalidatePath(`${lessonBase(courseId, subjectId, moduleId, lessonId)}/assessments`);
  if (questionId) {
    revalidatePath(`${base}/${questionId}`);
    revalidatePath(`${base}/${questionId}/edit`);
  }
}

async function moveQuestionToOrder(
  tx: TransactionClient,
  lessonId: string,
  questionId: string,
  currentOrder: number,
  targetOrder: number,
  temporaryOrder: number,
) {
  const step = targetOrder > currentOrder ? 1 : -1;
  let order = currentOrder;

  while (order !== targetOrder) {
    const nextOrder = order + step;
    const neighbor = await tx.question.findUnique({
      where: { lessonId_order: { lessonId, order: nextOrder } },
      select: { id: true },
    });
    if (!neighbor) throw new Error("QUESTION_ORDER_INTEGRITY");

    await tx.question.update({ where: { id: questionId }, data: { order: temporaryOrder } });
    await tx.question.update({ where: { id: neighbor.id }, data: { order } });
    await tx.question.update({ where: { id: questionId }, data: { order: nextOrder } });
    order = nextOrder;
  }
}

export async function createQuestionAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  _state: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireAdmin();
  const [lesson, count] = await Promise.all([
    prisma.lesson.findFirst({
      where: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
      select: { id: true },
    }),
    prisma.question.count({
      where: {
        lessonId,
        lesson: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
      },
    }),
  ]);
  if (!lesson) return { message: "A aula não pertence à hierarquia informada." };

  const parsed = parseQuestionForm(formData, count + 1);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  let questionId: string;
  try {
    questionId = await prisma.$transaction(
      async (tx) => {
        const currentLesson = await tx.lesson.findFirst({
          where: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
          select: { id: true },
        });
        if (!currentLesson) throw new Error("INVALID_HIERARCHY");

        const question = await tx.question.create({
          data: {
            answers: {
              create: parsed.data.answers.map((answer, index) => ({
                isCorrect: answer.isCorrect,
                order: index + 1,
                text: answer.text,
              })),
            },
            difficulty: parsed.data.difficulty as QuestionDifficulty,
            explanation: parsed.data.explanation,
            lessonId,
            order: count + 1,
            prompt: parsed.data.prompt,
            status: ContentStatus.DRAFT,
            type: parsed.data.type as QuestionType,
          },
          select: { id: true },
        });
        await moveQuestionToOrder(
          tx,
          lessonId,
          question.id,
          count + 1,
          parsed.data.order,
          count + 2,
        );
        return question.id;
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return questionFailure(error);
  }

  revalidateQuestions(courseId, subjectId, moduleId, lessonId, questionId);
  redirect(`${questionBase(courseId, subjectId, moduleId, lessonId)}?success=question-created`);
}

export async function updateQuestionAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  questionId: string,
  _state: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireAdmin();
  const [question, count] = await Promise.all([
    prisma.question.findFirst({
      where: questionWhere(courseId, subjectId, moduleId, lessonId, questionId),
      select: {
        answers: {
          select: { _count: { select: { attemptAnswers: true } }, id: true, order: true },
        },
        id: true,
        order: true,
        status: true,
      },
    }),
    prisma.question.count({
      where: {
        lessonId,
        lesson: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
      },
    }),
  ]);
  if (!question || question.order === null) {
    return { message: "A questão não pertence à hierarquia informada." };
  }
  const currentOrder = question.order;
  const wasPublished = question.status === ContentStatus.PUBLISHED;

  const parsed = parseQuestionForm(formData, count);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  const existingById = new Map(question.answers.map((answer) => [answer.id, answer]));
  const submittedIds = new Set(parsed.data.answers.flatMap((answer) => (answer.id ? [answer.id] : [])));
  if ([...submittedIds].some((id) => !existingById.has(id))) {
    return { message: "A lista de alternativas não pertence a esta questão." };
  }
  const removed = question.answers.filter((answer) => !submittedIds.has(answer.id));
  if (removed.some((answer) => answer._count.attemptAnswers > 0)) {
    return { message: "Alternativas com respostas históricas não podem ser removidas." };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const result = await tx.question.updateMany({
          where: questionWhere(courseId, subjectId, moduleId, lessonId, questionId),
          data: {
            difficulty: parsed.data.difficulty as QuestionDifficulty,
            explanation: parsed.data.explanation,
            prompt: parsed.data.prompt,
            status: wasPublished ? ContentStatus.DRAFT : undefined,
            type: parsed.data.type as QuestionType,
          },
        });
        if (result.count !== 1) throw new Error("INVALID_HIERARCHY");

        const highestOrder = Math.max(0, ...question.answers.map((answer) => answer.order));
        for (const [index, answer] of question.answers.entries()) {
          await tx.answer.update({
            where: { id: answer.id },
            data: { order: highestOrder + parsed.data.answers.length + index + 1 },
          });
        }

        if (removed.length > 0) {
          await tx.answer.deleteMany({
            where: { id: { in: removed.map((answer) => answer.id) }, questionId },
          });
        }

        for (const [index, answer] of parsed.data.answers.entries()) {
          if (answer.id) {
            await tx.answer.update({
              where: { id_questionId: { id: answer.id, questionId } },
              data: { isCorrect: answer.isCorrect, order: index + 1, text: answer.text },
            });
          } else {
            await tx.answer.create({
              data: {
                isCorrect: answer.isCorrect,
                order: index + 1,
                questionId,
                text: answer.text,
              },
            });
          }
        }

        await moveQuestionToOrder(
          tx,
          lessonId,
          questionId,
          currentOrder,
          parsed.data.order,
          count + 1,
        );
        if (wasPublished) {
          await tx.assessment.updateMany({
            where: {
              questions: { some: { questionId } },
              status: ContentStatus.PUBLISHED,
            },
            data: { status: ContentStatus.DRAFT },
          });
        }
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    return questionFailure(error);
  }

  revalidateQuestions(courseId, subjectId, moduleId, lessonId, questionId);
  redirect(
    `${questionBase(courseId, subjectId, moduleId, lessonId)}?success=${
      wasPublished ? "question-updated-draft" : "question-updated"
    }`,
  );
}

export async function setQuestionStatusAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  questionId: string,
  status: ContentStatus,
) {
  await requireAdmin();
  if (!Object.values(ContentStatus).includes(status)) throw new Error("INVALID_STATUS");
  const base = questionBase(courseId, subjectId, moduleId, lessonId);

  const question = await prisma.question.findFirst({
    where: questionWhere(courseId, subjectId, moduleId, lessonId, questionId),
    select: {
      answers: { select: { isCorrect: true, text: true } },
      explanation: true,
      prompt: true,
      type: true,
    },
  });
  if (!question) redirect(`${base}?error=invalid-hierarchy`);

  if (
    status === ContentStatus.PUBLISHED &&
    !validateQuestionConfiguration({
      answers: question.answers,
      explanation: question.explanation,
      prompt: question.prompt,
      type: question.type,
    })
  ) {
    redirect(`${base}?error=question-invalid`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.question.updateMany({
        where: questionWhere(courseId, subjectId, moduleId, lessonId, questionId),
        data: { status },
      });
      if (result.count !== 1) throw new Error("INVALID_HIERARCHY");
      if (status !== ContentStatus.PUBLISHED) {
        await tx.assessment.updateMany({
          where: {
            questions: { some: { questionId } },
            status: ContentStatus.PUBLISHED,
          },
          data: { status: ContentStatus.DRAFT },
        });
      }
    });
  } catch {
    redirect(`${base}?error=status-update`);
  }

  revalidateQuestions(courseId, subjectId, moduleId, lessonId, questionId);
  redirect(`${base}?success=question-${statusMessage(status)}`);
}

export async function moveQuestionAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  questionId: string,
  direction: MoveDirection,
) {
  await requireAdmin();
  if (direction !== "up" && direction !== "down") throw new Error("INVALID_DIRECTION");
  const base = questionBase(courseId, subjectId, moduleId, lessonId);
  let moved = false;

  try {
    moved = await prisma.$transaction(
      async (tx) => {
        const [question, count] = await Promise.all([
          tx.question.findFirst({
            where: questionWhere(courseId, subjectId, moduleId, lessonId, questionId),
            select: { order: true },
          }),
          tx.question.count({
            where: {
              lessonId,
              lesson: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
            },
          }),
        ]);
        if (!question || question.order === null) throw new Error("INVALID_HIERARCHY");
        const target = question.order + (direction === "up" ? -1 : 1);
        if (target < 1 || target > count) return false;
        await moveQuestionToOrder(tx, lessonId, questionId, question.order, target, count + 1);
        return true;
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    redirect(`${base}?error=reorder-failed`);
  }

  revalidateQuestions(courseId, subjectId, moduleId, lessonId, questionId);
  redirect(`${base}?success=${moved ? "question-reordered" : "order-unchanged"}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AssessmentFormState } from "@/lib/assessment-validation";
import { parseAssessmentForm, parsePositiveWeight } from "@/lib/assessment-validation";
import { requireAdmin } from "@/lib/auth-guards";
import { ContentStatus, Prisma } from "@/lib/generated/prisma/client";
import { validateQuestionConfiguration } from "@/lib/question-validation";
import { prisma } from "@/lib/prisma";

type MoveDirection = "down" | "up";
type TransactionClient = Prisma.TransactionClient;

function lessonBase(courseId: string, subjectId: string, moduleId: string, lessonId: string) {
  return `/admin/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}`;
}

function assessmentBase(courseId: string, subjectId: string, moduleId: string, lessonId: string) {
  return `${lessonBase(courseId, subjectId, moduleId, lessonId)}/assessments`;
}

function hierarchyWhere(courseId: string, subjectId: string, moduleId: string, lessonId: string) {
  return {
    id: lessonId,
    moduleId,
    module: { subjectId, subject: { courseId } },
  };
}

function assessmentWhere(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
) {
  return {
    id: assessmentId,
    lessonId,
    lesson: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
  };
}

function errorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) return String(error.code);
  return null;
}

function assessmentFailure(error: unknown): AssessmentFormState {
  if (errorCode(error) === "P2002") {
    return {
      errors: { slug: ["Este slug já está em uso por outra avaliação."] },
      message: "Não foi possível salvar a avaliação.",
    };
  }
  return { message: "Não foi possível salvar a avaliação. Tente novamente." };
}

function statusMessage(status: ContentStatus) {
  if (status === ContentStatus.PUBLISHED) return "published";
  if (status === ContentStatus.ARCHIVED) return "archived";
  return "unpublished";
}

function revalidateAssessments(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId?: string,
) {
  const lessons = `/admin/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/lessons`;
  const base = assessmentBase(courseId, subjectId, moduleId, lessonId);
  revalidatePath(lessons);
  revalidatePath(base);
  if (assessmentId) {
    revalidatePath(`${base}/${assessmentId}`);
    revalidatePath(`${base}/${assessmentId}/edit`);
  }
}

async function moveAssessmentQuestionToOrder(
  tx: TransactionClient,
  assessmentId: string,
  questionId: string,
  currentOrder: number,
  targetOrder: number,
  temporaryOrder: number,
) {
  const step = targetOrder > currentOrder ? 1 : -1;
  let order = currentOrder;

  while (order !== targetOrder) {
    const nextOrder = order + step;
    const neighbor = await tx.assessmentQuestion.findUnique({
      where: { assessmentId_order: { assessmentId, order: nextOrder } },
      select: { questionId: true },
    });
    if (!neighbor) throw new Error("ASSESSMENT_QUESTION_ORDER_INTEGRITY");

    await tx.assessmentQuestion.update({
      where: { assessmentId_questionId: { assessmentId, questionId } },
      data: { order: temporaryOrder },
    });
    await tx.assessmentQuestion.update({
      where: { assessmentId_questionId: { assessmentId, questionId: neighbor.questionId } },
      data: { order },
    });
    await tx.assessmentQuestion.update({
      where: { assessmentId_questionId: { assessmentId, questionId } },
      data: { order: nextOrder },
    });
    order = nextOrder;
  }
}

export async function createAssessmentAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  _state: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  await requireAdmin();
  const lesson = await prisma.lesson.findFirst({
    where: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
    select: { id: true },
  });
  if (!lesson) return { message: "A aula não pertence à hierarquia informada." };

  const parsed = parseAssessmentForm(formData);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  let assessmentId: string;
  try {
    const assessment = await prisma.assessment.create({
      data: {
        ...parsed.data,
        lessonId,
        status: ContentStatus.DRAFT,
      },
      select: { id: true },
    });
    assessmentId = assessment.id;
  } catch (error) {
    return assessmentFailure(error);
  }

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(`${assessmentBase(courseId, subjectId, moduleId, lessonId)}?success=assessment-created`);
}

export async function updateAssessmentAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
  _state: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  await requireAdmin();
  const currentAssessment = await prisma.assessment.findFirst({
    where: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
    select: { status: true },
  });
  if (!currentAssessment) return { message: "A avaliação não pertence à hierarquia informada." };
  const parsed = parseAssessmentForm(formData);
  if (!parsed.success) return { errors: parsed.errors, message: "Revise os campos indicados." };

  try {
    const result = await prisma.assessment.updateMany({
      where: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
      data: {
        ...parsed.data,
        status:
          currentAssessment.status === ContentStatus.PUBLISHED
            ? ContentStatus.DRAFT
            : undefined,
      },
    });
    if (result.count !== 1) return { message: "A avaliação não pertence à hierarquia informada." };
  } catch (error) {
    return assessmentFailure(error);
  }

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(
    `${assessmentBase(courseId, subjectId, moduleId, lessonId)}?success=${
      currentAssessment.status === ContentStatus.PUBLISHED
        ? "assessment-updated-draft"
        : "assessment-updated"
    }`,
  );
}

export async function addAssessmentQuestionsAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
  formData: FormData,
) {
  await requireAdmin();
  const base = `${assessmentBase(courseId, subjectId, moduleId, lessonId)}/${assessmentId}`;
  const questionIds = [
    ...new Set(
      formData
        .getAll("questionIds")
        .filter((value): value is string => typeof value === "string" && value.length <= 191),
    ),
  ];
  if (questionIds.length === 0 || questionIds.length > 50) {
    redirect(`${base}?error=question-selection-required`);
  }

  const [assessment, questions] = await Promise.all([
    prisma.assessment.findFirst({
      where: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
      select: { id: true },
    }),
    prisma.question.findMany({
      where: {
        id: { in: questionIds },
        lessonId,
        lesson: hierarchyWhere(courseId, subjectId, moduleId, lessonId),
        status: { not: ContentStatus.ARCHIVED },
      },
      select: { id: true },
    }),
  ]);
  if (!assessment || questions.length !== questionIds.length) {
    redirect(`${base}?error=invalid-hierarchy`);
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentAssessment = await tx.assessment.findFirst({
          where: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
          select: { id: true },
        });
        if (!currentAssessment) throw new Error("INVALID_HIERARCHY");

        const [count, existing] = await Promise.all([
          tx.assessmentQuestion.count({ where: { assessmentId } }),
          tx.assessmentQuestion.findMany({
            where: { assessmentId, questionId: { in: questionIds } },
            select: { questionId: true },
          }),
        ]);
        const existingIds = new Set(existing.map((item) => item.questionId));
        const newIds = questionIds.filter((id) => !existingIds.has(id));

        for (const [index, questionId] of newIds.entries()) {
          await tx.assessmentQuestion.create({
            data: {
              assessmentId,
              order: count + index + 1,
              questionId,
              weight: "1.00",
            },
          });
        }
        if (newIds.length > 0) {
          await tx.assessment.updateMany({
            where: { id: assessmentId, status: ContentStatus.PUBLISHED },
            data: { status: ContentStatus.DRAFT },
          });
        }
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    redirect(`${base}?error=question-add-failed`);
  }

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(`${base}?success=assessment-questions-added`);
}

export async function removeAssessmentQuestionAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
  questionId: string,
) {
  await requireAdmin();
  const base = `${assessmentBase(courseId, subjectId, moduleId, lessonId)}/${assessmentId}`;

  try {
    await prisma.$transaction(
      async (tx) => {
        const relation = await tx.assessmentQuestion.findFirst({
          where: {
            assessmentId,
            assessment: assessmentWhere(
              courseId,
              subjectId,
              moduleId,
              lessonId,
              assessmentId,
            ),
            questionId,
            question: { lessonId },
          },
          select: { order: true },
        });
        if (!relation) throw new Error("INVALID_HIERARCHY");

        await tx.assessmentQuestion.delete({
          where: { assessmentId_questionId: { assessmentId, questionId } },
        });
        const following = await tx.assessmentQuestion.findMany({
          where: { assessmentId, order: { gt: relation.order } },
          orderBy: { order: "asc" },
          select: { order: true, questionId: true },
        });
        for (const item of following) {
          await tx.assessmentQuestion.update({
            where: {
              assessmentId_questionId: { assessmentId, questionId: item.questionId },
            },
            data: { order: item.order - 1 },
          });
        }
        await tx.assessment.updateMany({
          where: { id: assessmentId, status: ContentStatus.PUBLISHED },
          data: { status: ContentStatus.DRAFT },
        });
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    redirect(`${base}?error=question-remove-failed`);
  }

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(`${base}?success=assessment-question-removed`);
}

export async function updateAssessmentQuestionWeightAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
  questionId: string,
  formData: FormData,
) {
  await requireAdmin();
  const base = `${assessmentBase(courseId, subjectId, moduleId, lessonId)}/${assessmentId}`;
  const weight = parsePositiveWeight(formData);
  if (!weight) redirect(`${base}?error=invalid-weight`);

  const relation = await prisma.assessmentQuestion.findFirst({
    where: {
      assessmentId,
      assessment: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
      questionId,
      question: { lessonId },
    },
    select: { assessmentId: true },
  });
  if (!relation) redirect(`${base}?error=invalid-hierarchy`);

  await prisma.$transaction([
    prisma.assessmentQuestion.update({
      where: { assessmentId_questionId: { assessmentId, questionId } },
      data: { weight },
    }),
    prisma.assessment.updateMany({
      where: { id: assessmentId, status: ContentStatus.PUBLISHED },
      data: { status: ContentStatus.DRAFT },
    }),
  ]);

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(`${base}?success=assessment-weight-updated`);
}

export async function moveAssessmentQuestionAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
  questionId: string,
  direction: MoveDirection,
) {
  await requireAdmin();
  if (direction !== "up" && direction !== "down") throw new Error("INVALID_DIRECTION");
  const base = `${assessmentBase(courseId, subjectId, moduleId, lessonId)}/${assessmentId}`;
  let moved = false;

  try {
    moved = await prisma.$transaction(
      async (tx) => {
        const [relation, count] = await Promise.all([
          tx.assessmentQuestion.findFirst({
            where: {
              assessmentId,
              assessment: assessmentWhere(
                courseId,
                subjectId,
                moduleId,
                lessonId,
                assessmentId,
              ),
              questionId,
              question: { lessonId },
            },
            select: { order: true },
          }),
          tx.assessmentQuestion.count({ where: { assessmentId } }),
        ]);
        if (!relation) throw new Error("INVALID_HIERARCHY");
        const target = relation.order + (direction === "up" ? -1 : 1);
        if (target < 1 || target > count) return false;
        await moveAssessmentQuestionToOrder(
          tx,
          assessmentId,
          questionId,
          relation.order,
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

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(`${base}?success=${moved ? "assessment-question-reordered" : "order-unchanged"}`);
}

export async function setAssessmentStatusAction(
  courseId: string,
  subjectId: string,
  moduleId: string,
  lessonId: string,
  assessmentId: string,
  status: ContentStatus,
) {
  await requireAdmin();
  if (!Object.values(ContentStatus).includes(status)) throw new Error("INVALID_STATUS");
  const base = assessmentBase(courseId, subjectId, moduleId, lessonId);

  const assessment = await prisma.assessment.findFirst({
    where: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
    select: {
      maxScore: true,
      questions: {
        select: {
          question: {
            select: {
              answers: { select: { isCorrect: true, text: true } },
              explanation: true,
              lessonId: true,
              prompt: true,
              status: true,
              type: true,
            },
          },
          weight: true,
        },
      },
      timeLimitMinutes: true,
      title: true,
    },
  });
  if (!assessment) redirect(`${base}?error=invalid-hierarchy`);

  if (status === ContentStatus.PUBLISHED) {
    if (assessment.questions.length === 0) redirect(`${base}?error=assessment-no-questions`);
    const invalidQuestion = assessment.questions.some(
      ({ question }) =>
        question.lessonId !== lessonId ||
        question.status !== ContentStatus.PUBLISHED ||
        !validateQuestionConfiguration({
          answers: question.answers,
          explanation: question.explanation,
          prompt: question.prompt,
          type: question.type,
        }),
    );
    if (invalidQuestion) redirect(`${base}?error=assessment-invalid-questions`);

    const totalWeight = assessment.questions.reduce(
      (total, item) => total.plus(item.weight),
      new Prisma.Decimal(0),
    );
    if (!totalWeight.equals(assessment.maxScore)) {
      redirect(`${base}?error=assessment-score-mismatch`);
    }
  }

  const result = await prisma.assessment.updateMany({
    where: assessmentWhere(courseId, subjectId, moduleId, lessonId, assessmentId),
    data: { status },
  });
  if (result.count !== 1) redirect(`${base}?error=invalid-hierarchy`);

  revalidateAssessments(courseId, subjectId, moduleId, lessonId, assessmentId);
  redirect(`${base}?success=assessment-${statusMessage(status)}`);
}

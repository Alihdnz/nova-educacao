import { Prisma } from "@/lib/generated/prisma/client";

type ScoringAssessment = {
  maxScore: Prisma.Decimal;
  passingPercentage: Prisma.Decimal;
  questions: {
    question: {
      answers: { id: string; isCorrect: boolean }[];
      id: string;
    };
    weight: Prisma.Decimal;
  }[];
};

export function calculateAssessmentResult(
  assessment: ScoringAssessment,
  answers: { questionId: string; selectedAnswerId: string }[],
) {
  const selectedByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedAnswerId]),
  );
  const correctness = new Map<string, boolean>();
  let score = new Prisma.Decimal(0);
  let correctAnswers = 0;

  for (const item of assessment.questions) {
    const correctAnswer = item.question.answers.find((answer) => answer.isCorrect);
    const isCorrect =
      correctAnswer?.id === selectedByQuestion.get(item.question.id);
    correctness.set(item.question.id, isCorrect);

    if (isCorrect) {
      score = score.plus(item.weight);
      correctAnswers += 1;
    }
  }

  if (score.greaterThan(assessment.maxScore)) score = assessment.maxScore;
  if (score.lessThan(0)) score = new Prisma.Decimal(0);

  const percentage = score
    .dividedBy(assessment.maxScore)
    .times(100)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  return {
    correctAnswers,
    correctness,
    maxScore: assessment.maxScore,
    passed: percentage.greaterThanOrEqualTo(assessment.passingPercentage),
    passingPercentage: assessment.passingPercentage,
    percentage,
    score: score.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
    totalQuestions: assessment.questions.length,
  };
}

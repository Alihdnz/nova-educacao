export const questionTypes = ["SINGLE_CHOICE", "TRUE_FALSE"] as const;
export const questionDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

export type QuestionTypeValue = (typeof questionTypes)[number];
export type QuestionDifficultyValue = (typeof questionDifficulties)[number];

export type QuestionAnswerInput = {
  id?: string;
  isCorrect: boolean;
  text: string;
};

export type QuestionFormState = {
  errors?: Partial<
    Record<"answers" | "difficulty" | "explanation" | "order" | "prompt" | "type", string[]>
  >;
  message?: string;
};

export const initialQuestionFormState: QuestionFormState = {};

export type ParsedQuestion = {
  answers: QuestionAnswerInput[];
  difficulty: QuestionDifficultyValue;
  explanation: string | null;
  order: number;
  prompt: string;
  type: QuestionTypeValue;
};

type QuestionValidationResult =
  | { data: ParsedQuestion; success: true }
  | { errors: NonNullable<QuestionFormState["errors"]>; success: false };

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseAnswers(value: string): QuestionAnswerInput[] | null {
  if (!value || value.length > 30_000) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;

    return parsed.map((answer) => {
      if (!answer || typeof answer !== "object") throw new Error("INVALID_ANSWER");
      const entry = answer as Record<string, unknown>;
      return {
        id: typeof entry.id === "string" ? entry.id.trim() : undefined,
        isCorrect: entry.isCorrect === true,
        text: typeof entry.text === "string" ? entry.text.trim() : "",
      };
    });
  } catch {
    return null;
  }
}

export function validateQuestionConfiguration({
  answers,
  explanation,
  prompt,
  type,
}: Pick<ParsedQuestion, "answers" | "explanation" | "prompt" | "type">) {
  if (!prompt.trim() || !explanation?.trim()) return false;
  if (type === "TRUE_FALSE" && answers.length !== 2) return false;
  if (type === "SINGLE_CHOICE" && (answers.length < 2 || answers.length > 8)) return false;
  if (answers.some((answer) => !answer.text.trim())) return false;
  return answers.filter((answer) => answer.isCorrect).length === 1;
}

export function parseQuestionForm(
  formData: FormData,
  maximumOrder: number,
): QuestionValidationResult {
  const prompt = readString(formData, "prompt");
  const rawType = readString(formData, "type");
  const rawDifficulty = readString(formData, "difficulty");
  const explanation = readString(formData, "explanation");
  const order = Number(readString(formData, "order"));
  const answers = parseAnswers(readString(formData, "answers"));
  const errors: NonNullable<QuestionFormState["errors"]> = {};

  const type = questionTypes.includes(rawType as QuestionTypeValue)
    ? (rawType as QuestionTypeValue)
    : null;
  const difficulty = questionDifficulties.includes(rawDifficulty as QuestionDifficultyValue)
    ? (rawDifficulty as QuestionDifficultyValue)
    : null;

  if (!prompt) errors.prompt = ["Informe o enunciado."];
  else if (prompt.length > 5_000) errors.prompt = ["Use no máximo 5.000 caracteres."];

  if (!type) errors.type = ["Selecione um tipo válido."];
  if (!difficulty) errors.difficulty = ["Selecione uma dificuldade válida."];
  if (explanation.length > 10_000) {
    errors.explanation = ["Use no máximo 10.000 caracteres."];
  }

  if (!Number.isInteger(order) || order < 1 || order > maximumOrder) {
    errors.order = [`Informe uma posição entre 1 e ${Math.max(1, maximumOrder)}.`];
  }

  if (!answers) {
    errors.answers = ["Informe alternativas válidas."];
  } else {
    if (type === "TRUE_FALSE" && answers.length !== 2) {
      errors.answers = ["Questões de verdadeiro ou falso devem possuir duas alternativas."];
    } else if (type === "SINGLE_CHOICE" && (answers.length < 2 || answers.length > 8)) {
      errors.answers = ["Questões de escolha única devem possuir entre 2 e 8 alternativas."];
    }

    if (answers.some((answer) => !answer.text || answer.text.length > 2_000)) {
      errors.answers = ["Cada alternativa deve possuir entre 1 e 2.000 caracteres."];
    }

    const normalizedTexts = answers.map((answer) => answer.text.toLocaleLowerCase("pt-BR"));
    if (new Set(normalizedTexts).size !== normalizedTexts.length) {
      errors.answers = ["Não repita o texto de uma alternativa."];
    }

    const answerIds = answers.flatMap((answer) => (answer.id ? [answer.id] : []));
    if (
      answerIds.some((id) => id.length > 191) ||
      new Set(answerIds).size !== answerIds.length
    ) {
      errors.answers = ["A lista de alternativas é inválida."];
    }

    if (answers.filter((answer) => answer.isCorrect).length !== 1) {
      errors.answers = ["Defina exatamente uma alternativa correta."];
    }
  }

  if (!type || !difficulty || !answers || Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  return {
    data: {
      answers,
      difficulty,
      explanation: explanation || null,
      order,
      prompt,
      type,
    },
    success: true,
  };
}

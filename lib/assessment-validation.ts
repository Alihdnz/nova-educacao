import { normalizeSlug } from "@/lib/course-structure-validation";

export type AssessmentFormState = {
  errors?: Partial<
    Record<
      | "description"
      | "maxScore"
      | "passingPercentage"
      | "slug"
      | "timeLimitMinutes"
      | "title",
      string[]
    >
  >;
  message?: string;
};

export const initialAssessmentFormState: AssessmentFormState = {};

export type ParsedAssessment = {
  description: string | null;
  maxScore: string;
  passingPercentage: string;
  slug: string;
  timeLimitMinutes: number | null;
  title: string;
};

type AssessmentValidationResult =
  | { data: ParsedAssessment; success: true }
  | { errors: NonNullable<AssessmentFormState["errors"]>; success: false };

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function decimalValue(value: string) {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 9_999.99
    ? parsed.toFixed(2)
    : null;
}

function percentageValue(value: string) {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
    ? parsed.toFixed(2)
    : null;
}

export function parsePositiveWeight(formData: FormData) {
  return decimalValue(readString(formData, "weight"));
}

export function parseAssessmentForm(formData: FormData): AssessmentValidationResult {
  const title = readString(formData, "title");
  const slug = normalizeSlug(readString(formData, "slug"));
  const description = readString(formData, "description");
  const maxScore = decimalValue(readString(formData, "maxScore"));
  const passingPercentage = percentageValue(
    readString(formData, "passingPercentage"),
  );
  const rawTimeLimit = readString(formData, "timeLimitMinutes");
  const timeLimitMinutes = rawTimeLimit ? Number(rawTimeLimit) : null;
  const errors: NonNullable<AssessmentFormState["errors"]> = {};

  if (!title) errors.title = ["Informe um título."];
  else if (title.length > 160) errors.title = ["Use no máximo 160 caracteres."];

  if (!slug) errors.slug = ["Informe um slug válido."];
  else if (slug.length > 160) errors.slug = ["Use no máximo 160 caracteres."];

  if (description.length > 10_000) {
    errors.description = ["Use no máximo 10.000 caracteres."];
  }

  if (!maxScore) errors.maxScore = ["Informe uma nota máxima entre 0,01 e 9.999,99."];

  if (!passingPercentage) {
    errors.passingPercentage = ["Informe um percentual entre 0 e 100."];
  }

  if (
    timeLimitMinutes !== null &&
    (!Number.isInteger(timeLimitMinutes) || timeLimitMinutes < 1 || timeLimitMinutes > 1_440)
  ) {
    errors.timeLimitMinutes = ["Informe um tempo entre 1 e 1.440 minutos."];
  }

  if (!maxScore || !passingPercentage || Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  return {
    data: {
      description: description || null,
      maxScore,
      passingPercentage,
      slug,
      timeLimitMinutes,
      title,
    },
    success: true,
  };
}

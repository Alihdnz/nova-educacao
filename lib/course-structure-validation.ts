export const structureStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type StructureStatus = (typeof structureStatuses)[number];

export type StructureFormState = {
  errors?: Partial<
    Record<
      "title" | "slug" | "description" | "coverImageUrl" | "status" | "order",
      string[]
    >
  >;
  message?: string;
};

export const initialStructureFormState: StructureFormState = {};

type ParsedCourse = {
  coverImageUrl: string | null;
  description: string | null;
  slug: string;
  status: StructureStatus;
  title: string;
};

type ParsedChild = {
  description: string | null;
  order: number;
  slug: string;
  status: StructureStatus;
  title: string;
};

type ValidationResult<T> =
  | { data: T; success: true }
  | { errors: NonNullable<StructureFormState["errors"]>; success: false };

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCommon(formData: FormData) {
  const title = readString(formData, "title");
  const slug = normalizeSlug(readString(formData, "slug"));
  const description = readString(formData, "description");
  const rawStatus = readString(formData, "status");
  const errors: NonNullable<StructureFormState["errors"]> = {};

  if (!title) errors.title = ["Informe um título."];
  else if (title.length > 160) errors.title = ["Use no máximo 160 caracteres."];

  if (!slug) errors.slug = ["Informe um slug válido."];
  else if (slug.length > 160) errors.slug = ["Use no máximo 160 caracteres."];

  if (description.length > 10000) {
    errors.description = ["Use no máximo 10.000 caracteres."];
  }

  const status = structureStatuses.includes(rawStatus as StructureStatus)
    ? (rawStatus as StructureStatus)
    : null;

  if (!status) errors.status = ["Selecione um status válido."];

  return {
    description: description || null,
    errors,
    slug,
    status,
    title,
  };
}

export function parseCourseForm(formData: FormData): ValidationResult<ParsedCourse> {
  const common = parseCommon(formData);
  const coverImageUrl = readString(formData, "coverImageUrl");

  if (coverImageUrl) {
    try {
      const url = new URL(coverImageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      if (coverImageUrl.length > 2048) throw new Error();
    } catch {
      common.errors.coverImageUrl = ["Informe uma URL HTTP ou HTTPS válida."];
    }
  }

  if (!common.status || Object.keys(common.errors).length > 0) {
    return { errors: common.errors, success: false };
  }

  return {
    data: {
      coverImageUrl: coverImageUrl || null,
      description: common.description,
      slug: common.slug,
      status: common.status,
      title: common.title,
    },
    success: true,
  };
}

export function parseChildForm(
  formData: FormData,
  maximumOrder: number,
): ValidationResult<ParsedChild> {
  const common = parseCommon(formData);
  const rawOrder = readString(formData, "order");
  const order = Number(rawOrder);

  if (!Number.isInteger(order) || order < 1 || order > maximumOrder) {
    common.errors.order = [
      `Informe uma posição entre 1 e ${Math.max(1, maximumOrder)}.`,
    ];
  }

  if (!common.status || Object.keys(common.errors).length > 0) {
    return { errors: common.errors, success: false };
  }

  return {
    data: {
      description: common.description,
      order,
      slug: common.slug,
      status: common.status,
      title: common.title,
    },
    success: true,
  };
}

import { normalizeSlug } from '@/lib/course-structure-validation';
import { safeHttpUrl } from '@/lib/content-security';

export type LessonFormState = {
  errors?: Partial<
    Record<'content' | 'description' | 'imageUrl' | 'order' | 'slug' | 'title', string[]>
  >;
  message?: string;
};

export const initialLessonFormState: LessonFormState = {};

export type ParsedLesson = {
  content: string;
  description: string;
  imageUrl: string | null;
  order: number;
  slug: string;
  title: string;
};

type LessonValidationResult =
  | { data: ParsedLesson; success: true }
  | { errors: NonNullable<LessonFormState['errors']>; success: false };

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function markdownUrls(content: string) {
  const urls: string[] = [];
  const inlinePattern = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))/g;
  const referencePattern = /^\s*\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm;

  for (const match of content.matchAll(inlinePattern)) {
    urls.push(match[1] ?? match[2] ?? '');
  }

  for (const match of content.matchAll(referencePattern)) {
    urls.push(match[1] ?? match[2] ?? '');
  }

  return urls;
}

export function parseLessonForm(
  formData: FormData,
  maximumOrder: number,
): LessonValidationResult {
  const title = readString(formData, 'title');
  const slug = normalizeSlug(readString(formData, 'slug'));
  const description = readString(formData, 'description');
  const content = readString(formData, 'content');
  const imageUrl = readString(formData, 'imageUrl');
  const order = Number(readString(formData, 'order'));
  const errors: NonNullable<LessonFormState['errors']> = {};

  if (!title) errors.title = ['Informe um título.'];
  else if (title.length > 160) errors.title = ['Use no máximo 160 caracteres.'];

  if (!slug) errors.slug = ['Informe um slug válido.'];
  else if (slug.length > 160) errors.slug = ['Use no máximo 160 caracteres.'];

  if (!description) errors.description = ['Informe um resumo.'];
  else if (description.length > 600) {
    errors.description = ['Use no máximo 600 caracteres.'];
  }

  if (!content) errors.content = ['Adicione o conteúdo da aula.'];
  else if (content.length > 300_000) {
    errors.content = ['Use no máximo 300.000 caracteres.'];
  } else if (markdownUrls(content).some((url) => !safeHttpUrl(url))) {
    errors.content = ['Links e imagens devem utilizar URLs HTTP ou HTTPS válidas.'];
  }

  if (imageUrl && (imageUrl.length > 2048 || !safeHttpUrl(imageUrl))) {
    errors.imageUrl = ['Informe uma URL HTTP ou HTTPS válida.'];
  }

  if (!Number.isInteger(order) || order < 1 || order > maximumOrder) {
    errors.order = [`Informe uma posição entre 1 e ${Math.max(1, maximumOrder)}.`];
  }

  if (Object.keys(errors).length > 0) return { errors, success: false };

  return {
    data: {
      content,
      description,
      imageUrl: imageUrl ? safeHttpUrl(imageUrl) : null,
      order,
      slug,
      title,
    },
    success: true,
  };
}

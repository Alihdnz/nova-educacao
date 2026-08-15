"use client";

import { ImageOff, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { LessonEditor } from "@/components/admin/lesson-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeSlug, type StructureStatus } from "@/lib/course-structure-validation";
import { safeHttpUrl } from "@/lib/content-security";
import { initialLessonFormState, type LessonFormState } from "@/lib/lesson-validation";

type LessonFormAction = (
  state: LessonFormState,
  formData: FormData,
) => Promise<LessonFormState>;

type LessonDefaults = {
  content?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  order?: number;
  slug?: string;
  status?: StructureStatus;
  title?: string;
};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="text-sm text-destructive">{errors[0]}</p> : null;
}

function SectionTitle({ children, id }: { children: string; id: string }) {
  return <h2 className="text-sm font-semibold" id={id}>{children}</h2>;
}

export function LessonForm({
  action,
  cancelHref,
  defaults,
  maximumOrder,
  submitLabel,
}: {
  action: LessonFormAction;
  cancelHref: string;
  defaults?: LessonDefaults;
  maximumOrder: number;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialLessonFormState);
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [content, setContent] = useState(defaults?.content ?? "");
  const [imageUrl, setImageUrl] = useState(defaults?.imageUrl ?? "");
  const safeImageUrl = imageUrl ? safeHttpUrl(imageUrl) : null;

  return (
    <form action={formAction} className="overflow-hidden rounded-lg border bg-background">
      {state.message ? (
        <p
          className="m-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <section className="space-y-5 p-5 sm:p-6" aria-labelledby="basic-information-title">
        <SectionTitle id="basic-information-title">Informações básicas</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Título
            </label>
            <Input
              aria-invalid={state.errors?.title?.length ? true : undefined}
              defaultValue={defaults?.title}
              id="title"
              maxLength={160}
              name="title"
              onChange={(event) => {
                if (!slugTouched) setSlug(normalizeSlug(event.target.value));
              }}
              required
            />
            <FieldError errors={state.errors?.title} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="slug">
              Slug
            </label>
            <Input
              aria-invalid={state.errors?.slug?.length ? true : undefined}
              id="slug"
              maxLength={160}
              name="slug"
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(normalizeSlug(event.target.value));
              }}
              required
              value={slug}
            />
            <FieldError errors={state.errors?.slug} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            Resumo
          </label>
          <Textarea
            aria-invalid={state.errors?.description?.length ? true : undefined}
            defaultValue={defaults?.description ?? ""}
            id="description"
            maxLength={600}
            name="description"
            required
          />
          <FieldError errors={state.errors?.description} />
        </div>
      </section>

      <section className="space-y-3 border-t p-5 sm:p-6" aria-labelledby="lesson-content-title">
        <SectionTitle id="lesson-content-title">Conteúdo</SectionTitle>
        <LessonEditor error={state.errors?.content} onChange={setContent} value={content} />
        <FieldError errors={state.errors?.content} />
      </section>

      <section className="space-y-4 border-t p-5 sm:p-6" aria-labelledby="lesson-media-title">
        <SectionTitle id="lesson-media-title">Mídia</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="imageUrl">
              URL da imagem principal
            </label>
            <div className="flex gap-2">
              <Input
                aria-invalid={state.errors?.imageUrl?.length ? true : undefined}
                id="imageUrl"
                maxLength={2048}
                name="imageUrl"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                type="url"
                value={imageUrl}
              />
              <Button
                aria-label="Remover imagem principal"
                disabled={!imageUrl}
                onClick={() => setImageUrl("")}
                size="icon"
                title="Remover imagem principal"
                type="button"
                variant="outline"
              >
                <ImageOff aria-hidden="true" />
              </Button>
            </div>
            <FieldError errors={state.errors?.imageUrl} />
          </div>
          <div className="aspect-video overflow-hidden rounded-md border bg-muted">
            {safeImageUrl ? (
              // Remote lesson media is intentionally unoptimized until storage is introduced.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Preview da imagem principal"
                className="size-full object-cover"
                src={safeImageUrl}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageOff aria-hidden="true" className="size-5" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t p-5 sm:p-6" aria-labelledby="lesson-metadata-title">
        <SectionTitle id="lesson-metadata-title">Metadados e publicação</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="order">
              Posição
            </label>
            <Input
              aria-invalid={state.errors?.order?.length ? true : undefined}
              defaultValue={defaults?.order ?? maximumOrder}
              id="order"
              max={maximumOrder}
              min={1}
              name="order"
              required
              type="number"
            />
            <FieldError errors={state.errors?.order} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <div className="flex h-10 items-center">
              <ContentStatusBadge status={defaults?.status ?? "DRAFT"} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 p-5 sm:flex-row sm:justify-end sm:p-6">
        <Link className={buttonVariants({ variant: "outline" })} href={cancelHref}>
          Cancelar
        </Link>
        <Button disabled={pending} type="submit">
          {pending ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

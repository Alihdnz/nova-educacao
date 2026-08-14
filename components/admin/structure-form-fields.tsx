"use client";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  initialStructureFormState,
  normalizeSlug,
  type StructureFormState,
  type StructureStatus,
} from "@/lib/course-structure-validation";
import { cn } from "@/lib/utils";

type FormAction = (
  state: StructureFormState,
  formData: FormData,
) => Promise<StructureFormState>;

type CommonDefaults = {
  description?: string | null;
  slug?: string;
  status?: StructureStatus;
  title?: string;
};

type CourseFormProps = {
  action: FormAction;
  cancelHref: string;
  defaults?: CommonDefaults & { coverImageUrl?: string | null };
  submitLabel: string;
};

type ChildFormProps = {
  action: FormAction;
  cancelHref: string;
  defaults?: CommonDefaults & { order?: number };
  entityLabel: "disciplina" | "módulo";
  maximumOrder: number;
  submitLabel: string;
};

const statusOptions = [
  { label: "Rascunho", value: "DRAFT" },
  { label: "Publicado", value: "PUBLISHED" },
  { label: "Arquivado", value: "ARCHIVED" },
] as const;

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? (
    <p className="text-sm text-destructive">{errors[0]}</p>
  ) : null;
}

function FormMessage({ state }: { state: StructureFormState }) {
  return state.message ? (
    <p
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {state.message}
    </p>
  ) : null;
}

function SubmitRow({
  cancelHref,
  pending,
  submitLabel,
}: {
  cancelHref: string;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
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
  );
}

function StatusField({
  error,
  defaultValue,
}: {
  defaultValue: StructureStatus;
  error?: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor="status">
        Status
      </label>
      <select
        aria-invalid={error?.length ? true : undefined}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          error?.length && "border-destructive",
        )}
        defaultValue={defaultValue}
        id="status"
        name="status"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError errors={error} />
    </div>
  );
}

export function CourseForm({ action, cancelHref, defaults, submitLabel }: CourseFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialStructureFormState,
  );
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));

  return (
    <form action={formAction} className="space-y-6 rounded-lg border bg-background p-5 sm:p-6">
      <FormMessage state={state} />
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
          Descrição
        </label>
        <Textarea
          aria-invalid={state.errors?.description?.length ? true : undefined}
          defaultValue={defaults?.description ?? ""}
          id="description"
          maxLength={10000}
          name="description"
        />
        <FieldError errors={state.errors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="coverImageUrl">
            URL da capa
          </label>
          <Input
            aria-invalid={state.errors?.coverImageUrl?.length ? true : undefined}
            defaultValue={defaults?.coverImageUrl ?? ""}
            id="coverImageUrl"
            maxLength={2048}
            name="coverImageUrl"
            placeholder="https://exemplo.com/capa.jpg"
            type="url"
          />
          <FieldError errors={state.errors?.coverImageUrl} />
        </div>
        <StatusField
          defaultValue={defaults?.status ?? "DRAFT"}
          error={state.errors?.status}
        />
      </div>

      <SubmitRow cancelHref={cancelHref} pending={pending} submitLabel={submitLabel} />
    </form>
  );
}

export function ChildStructureForm({
  action,
  cancelHref,
  defaults,
  entityLabel,
  maximumOrder,
  submitLabel,
}: ChildFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialStructureFormState,
  );
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));

  return (
    <form action={formAction} className="space-y-6 rounded-lg border bg-background p-5 sm:p-6">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Título da {entityLabel}
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
          Descrição
        </label>
        <Textarea
          aria-invalid={state.errors?.description?.length ? true : undefined}
          defaultValue={defaults?.description ?? ""}
          id="description"
          maxLength={10000}
          name="description"
        />
        <FieldError errors={state.errors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
          <p className="text-xs text-muted-foreground">
            Posição permitida: 1 a {maximumOrder}.
          </p>
          <FieldError errors={state.errors?.order} />
        </div>
        <StatusField
          defaultValue={defaults?.status ?? "DRAFT"}
          error={state.errors?.status}
        />
      </div>

      <SubmitRow cancelHref={cancelHref} pending={pending} submitLabel={submitLabel} />
    </form>
  );
}

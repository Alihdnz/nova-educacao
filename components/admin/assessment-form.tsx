"use client";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  initialAssessmentFormState,
  type AssessmentFormState,
} from "@/lib/assessment-validation";
import { normalizeSlug, type StructureStatus } from "@/lib/course-structure-validation";

type AssessmentFormAction = (
  state: AssessmentFormState,
  formData: FormData,
) => Promise<AssessmentFormState>;

type AssessmentDefaults = {
  description?: string | null;
  maxScore?: number | string;
  slug?: string;
  status?: StructureStatus;
  timeLimitMinutes?: number | null;
  title?: string;
};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="text-sm text-destructive">{errors[0]}</p> : null;
}

export function AssessmentForm({
  action,
  cancelHref,
  defaults,
  submitLabel,
}: {
  action: AssessmentFormAction;
  cancelHref: string;
  defaults?: AssessmentDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialAssessmentFormState);
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));

  return (
    <form action={formAction} className="overflow-hidden rounded-lg border bg-background">
      {state.message ? (
        <p className="m-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <section aria-labelledby="assessment-information" className="space-y-5 p-5 sm:p-6">
        <h2 className="text-sm font-semibold" id="assessment-information">Informações</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">Título</label>
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
            <label className="text-sm font-medium" htmlFor="slug">Slug</label>
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
          <label className="text-sm font-medium" htmlFor="description">Descrição e instruções</label>
          <Textarea
            aria-invalid={state.errors?.description?.length ? true : undefined}
            defaultValue={defaults?.description ?? ""}
            id="description"
            maxLength={10000}
            name="description"
          />
          <FieldError errors={state.errors?.description} />
        </div>
      </section>

      <section aria-labelledby="assessment-configuration" className="space-y-5 border-t p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold" id="assessment-configuration">Configuração</h2>
          <p className="mt-1 text-xs text-muted-foreground">A soma dos pesos deve corresponder à nota máxima antes da publicação.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="maxScore">Nota máxima</label>
            <Input
              aria-invalid={state.errors?.maxScore?.length ? true : undefined}
              defaultValue={String(defaults?.maxScore ?? 10)}
              id="maxScore"
              max="9999.99"
              min="0.01"
              name="maxScore"
              required
              step="0.01"
              type="number"
            />
            <FieldError errors={state.errors?.maxScore} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="timeLimitMinutes">Tempo limite em minutos</label>
            <Input
              aria-invalid={state.errors?.timeLimitMinutes?.length ? true : undefined}
              defaultValue={defaults?.timeLimitMinutes ?? ""}
              id="timeLimitMinutes"
              max={1440}
              min={1}
              name="timeLimitMinutes"
              placeholder="Sem limite"
              type="number"
            />
            <FieldError errors={state.errors?.timeLimitMinutes} />
          </div>
        </div>
      </section>

      <section aria-labelledby="assessment-publication" className="space-y-3 border-t p-5 sm:p-6">
        <h2 className="text-sm font-semibold" id="assessment-publication">Publicação</h2>
        <div className="flex h-10 items-center"><ContentStatusBadge status={defaults?.status ?? "DRAFT"} /></div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 p-5 sm:flex-row sm:justify-end sm:p-6">
        <Link className={buttonVariants({ variant: "outline" })} href={cancelHref}>Cancelar</Link>
        <Button disabled={pending} type="submit">
          {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

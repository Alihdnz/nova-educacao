"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function WeightSubmit() {
  const { pending } = useFormStatus();
  return (
    <button aria-label="Salvar peso" className={buttonVariants({ size: "icon", variant: "outline" })} disabled={pending} title="Salvar peso" type="submit">
      {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}
    </button>
  );
}

export function AssessmentWeightForm({ action, defaultValue }: { action: (formData: FormData) => Promise<void>; defaultValue: string }) {
  return (
    <form action={action} className="flex items-center gap-2">
      <Input aria-label="Peso da questão" className="w-24" defaultValue={defaultValue} max="9999.99" min="0.01" name="weight" required step="0.01" type="number" />
      <WeightSubmit />
    </form>
  );
}

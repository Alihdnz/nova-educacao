import { ArrowLeft, CircleHelp } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function CourseStructureNotFound() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border bg-background px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <CircleHelp aria-hidden="true" className="size-5" />
      </span>
      <h1 className="mt-4 text-lg font-semibold">Estrutura não encontrada</h1>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        O curso, a disciplina ou o módulo informado não existe nesta hierarquia.
      </p>
      <Link className={buttonVariants({ className: "mt-5", variant: "outline" })} href="/admin/courses">
        <ArrowLeft aria-hidden="true" />
        Voltar para cursos
      </Link>
    </div>
  );
}

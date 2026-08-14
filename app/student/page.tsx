import { ArrowLeft, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Área do estudante",
};

export default function StudentPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Área base"
        title="Área do estudante"
        description="Este espaço está preparado para receber a experiência do estudante em uma próxima etapa."
        actions={
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar
          </Link>
        }
      />

      <section className="flex items-start gap-4 py-8" aria-label="Estado da área">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <GraduationCap aria-hidden="true" className="size-5" />
        </span>
        <div className="space-y-1">
          <h2 className="font-semibold">Estrutura reservada</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Nenhuma funcionalidade educacional foi implementada nesta sprint.
          </p>
        </div>
      </section>
    </Container>
  );
}

import { BookLock } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function StudentContentNotFound() {
  return (
    <Container className="py-8 sm:py-10">
      <section className="rounded-lg border bg-background">
        <EmptyState
          action={
            <Link className={buttonVariants({ variant: "outline" })} href="/student">
              Voltar para meus cursos
            </Link>
          }
          description="O conteúdo não existe, não está publicado ou não pertence a uma matrícula válida."
          icon={BookLock}
          title="Conteúdo indisponível"
        />
      </section>
    </Container>
  );
}

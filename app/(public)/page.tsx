import { ArrowRight, GraduationCap, Settings2 } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

const areas = [
  {
    description: "Acompanhe aulas, avaliações e seu progresso de aprendizagem.",
    href: "/student",
    icon: GraduationCap,
    title: "Área do estudante",
  },
  {
    description: "Acesse a visão operacional e os recursos de gestão da plataforma.",
    href: "/admin",
    icon: Settings2,
    title: "Painel gestor",
  },
] as const;

export default function Home() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Ambiente de aprendizagem"
        title="Plataforma de Pré-Curso"
        description="Conteúdo, acompanhamento e gestão educacional em um único ambiente."
      />

      <section className="pt-8" aria-labelledby="areas-title">
        <h2 id="areas-title" className="mb-4 text-lg font-semibold">
          Áreas da plataforma
        </h2>
        <div className="divide-y rounded-lg border">
          {areas.map((area) => {
            const Icon = area.icon;

            return (
              <article
                key={area.href}
                className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex min-w-0 gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold">{area.title}</h3>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                      {area.description}
                    </p>
                  </div>
                </div>
                <Link
                  href={area.href}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Acessar
                  <ArrowRight aria-hidden="true" data-icon="inline-end" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </Container>
  );
}

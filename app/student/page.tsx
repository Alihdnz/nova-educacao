import { BookOpenCheck } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Área do estudante",
};

export default async function StudentPage() {
  const session = await requireRole(UserRole.STUDENT);

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Área do estudante"
        title={`Olá, ${session.user.name}`}
        description="Este é o seu ambiente de aprendizagem."
      />

      <section className="pt-8" aria-labelledby="learning-title">
        <div className="rounded-lg border bg-background">
          <div className="border-b px-5 py-4">
            <h2 id="learning-title" className="text-sm font-semibold">
              Seus cursos
            </h2>
          </div>
          <EmptyState
            description="Os cursos disponíveis para sua conta serão exibidos nesta área."
            icon={BookOpenCheck}
            title="Área de aprendizagem preparada"
          />
        </div>
      </section>
    </Container>
  );
}

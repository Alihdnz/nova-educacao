import { ArrowLeft, ShieldX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Acesso não autorizado",
};

export default async function ForbiddenPage() {
  const session = await getSession();
  const destination =
    session?.user.role === "ADMIN"
      ? "/admin"
      : session?.user.role === "STUDENT"
        ? "/student"
        : "/login";

  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <ShieldX aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Acesso não autorizado</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sua conta não possui permissão para acessar esta área.
        </p>
        <Link
          className={buttonVariants({ className: "mt-6", variant: "outline" })}
          href={destination}
        >
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Voltar para sua área
        </Link>
      </div>
    </Container>
  );
}

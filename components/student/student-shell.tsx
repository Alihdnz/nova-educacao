import { BookOpenText, GraduationCap, Home } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Container } from "@/components/layout/container";

export function StudentShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string };
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <Container className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 py-2">
          <Link href="/student" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenText aria-hidden="true" className="size-4" />
            </span>
            <span className="hidden truncate sm:inline">Nova Educação</span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-1 border-t pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0" aria-label="Área do aluno">
            <Link
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              href="/student"
            >
              <Home aria-hidden="true" className="size-4" />
              Início
            </Link>
            <Link
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              href="/student#meus-cursos"
            >
              <GraduationCap aria-hidden="true" className="size-4" />
              Meus cursos
            </Link>
          </nav>

          <div className="ml-auto min-w-0 text-right">
            <p className="max-w-40 truncate text-sm font-medium">{user.name}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Estudante</p>
          </div>
          <LogoutButton />
        </Container>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

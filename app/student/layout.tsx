import { BookOpenText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Container } from "@/components/layout/container";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/auth-guards";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(UserRole.STUDENT);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <Container className="flex h-16 items-center gap-4">
          <Link href="/student" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenText aria-hidden="true" className="size-4" />
            </span>
            <span className="hidden truncate sm:inline">Nova Educação</span>
          </Link>
          <div className="ml-auto min-w-0 text-right">
            <p className="max-w-44 truncate text-sm font-medium">{session.user.name}</p>
            <p className="hidden max-w-44 truncate text-xs text-muted-foreground sm:block">
              Estudante
            </p>
          </div>
          <LogoutButton />
        </Container>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

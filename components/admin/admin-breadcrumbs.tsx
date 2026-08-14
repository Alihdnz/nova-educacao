"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Dashboard",
  assessments: "Avaliações",
  courses: "Cursos",
  gamification: "Gamificação",
  lessons: "Aulas",
  modules: "Módulos",
  reports: "Relatórios",
  subjects: "Disciplinas",
  users: "Usuários",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="min-w-0" aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const current = index === segments.length - 1;
          const label = labels[segment] ?? decodeURIComponent(segment);

          return (
            <li className="flex min-w-0 items-center gap-1.5" key={href}>
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              ) : null}
              {current ? (
                <span className="truncate font-medium" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link
                  className="truncate text-muted-foreground hover:text-foreground"
                  href={href}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import { BookOpen, FileQuestion, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { AdminBreadcrumbProvider } from "@/components/admin/admin-breadcrumbs";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
  user: {
    email: string;
    name: string;
  };
};

export function AdminShell({ children, user }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <AdminBreadcrumbProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="sticky top-0 z-40 hidden h-screen lg:block">
          <AdminSidebar />
        </div>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-foreground/35"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div className="relative h-full w-[min(16rem,86vw)] shadow-xl">
            <AdminSidebar mobile onClose={() => setMenuOpen(false)} />
          </div>
          </div>
        ) : null}

        <div className="min-w-0">
          <AdminNavbar onOpenMenu={() => setMenuOpen(true)} user={user} />
          <main className="mx-auto w-full max-w-[100rem] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">
            {children}
          </main>
        </div>
        <nav aria-label="Navegação administrativa móvel" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/98 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgb(23_21_42/8%)] backdrop-blur lg:hidden">
          <ul className="grid grid-cols-4 gap-1">
            {[
              { href: "/admin", icon: LayoutDashboard, label: "Painel" },
              { href: "/admin/courses", icon: BookOpen, label: "Cursos" },
              { href: "/admin/questions", icon: FileQuestion, label: "Questões" },
              { href: "/admin/assessments", icon: ListChecks, label: "Avaliações" },
            ].map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  <Link className={active ? "nova-focus flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-primary/8 px-1 text-[0.64rem] font-semibold text-primary" : "nova-focus flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.64rem] font-semibold text-muted-foreground"} href={item.href}>
                    <Icon aria-hidden="true" className="size-5" />{item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </AdminBreadcrumbProvider>
  );
}

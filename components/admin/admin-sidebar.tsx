"use client";

import { BookOpen, BookOpenText, GraduationCap, LayoutDashboard, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/courses", icon: BookOpen, label: "Cursos" },
] as const;

type AdminSidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ mobile = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <BookOpenText aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Nova Educação</p>
          <p className="truncate text-xs text-muted-foreground">Painel gestor</p>
        </div>
        {mobile ? (
          <Button
            aria-label="Fechar menu"
            onClick={onClose}
            size="icon"
            title="Fechar menu"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navegação administrativa">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const classes = cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            );

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={classes}
                  href={item.href}
                  onClick={onClose}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <GraduationCap aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Ambiente administrativo</p>
            <p className="truncate text-xs text-muted-foreground">Acesso restrito</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Home,
  Menu,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { NovaLogo } from "@/components/brand/nova-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { exact: true, href: "/student", icon: Home, label: "Início", mobileLabel: "Início" },
  { href: "/student/courses", icon: BookOpen, label: "Meus cursos", mobileLabel: "Cursos" },
  { href: "/student/progress", icon: BarChart3, label: "Progresso", mobileLabel: "Progresso" },
  { href: "/student/exercises", icon: ClipboardCheck, label: "Exercícios", mobileLabel: "Avaliações" },
  { href: "/student/review", icon: RotateCcw, label: "Revisão", mobileLabel: "Revisão" },
  { href: "/student/profile", icon: UserRound, label: "Perfil", mobileLabel: "Perfil" },
] as const;

function isActive(pathname: string, item: (typeof navigation)[number]) {
  return "exact" in item && item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function StudentSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-between px-6">
        <NovaLogo className="w-36" href="/student" inverted priority />
        {mobile ? <Button aria-label="Fechar menu" className="text-white hover:bg-white/10 hover:text-white" onClick={onClose} size="icon" variant="ghost"><X aria-hidden="true" /></Button> : null}
      </div>
      <nav aria-label="Área do aluno" className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 px-4 text-[0.68rem] font-semibold uppercase text-sidebar-foreground/40">Aprendizagem</p>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link aria-current={active ? "page" : undefined} className={cn("nova-focus flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground shadow-[0_8px_24px_rgb(91_63_196/24%)]" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")} href={item.href} onClick={onClose}>
                  <Icon aria-hidden="true" className="size-5" />{item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-3 border-t border-sidebar-border px-5 py-4">
        <LogoutButton className="[&_button]:w-full [&_button]:justify-start [&_button]:text-sidebar-foreground/75 [&_button:hover]:bg-sidebar-accent [&_button:hover]:text-white" />
        <p className="px-1 text-xs text-sidebar-foreground/45">Conhecimento que move você.</p>
      </div>
    </aside>
  );
}

function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal do aluno" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/98 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgb(23_21_42/8%)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-6 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link aria-current={active ? "page" : undefined} className={cn("nova-focus flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.62rem] font-semibold", active ? "bg-primary/8 text-primary" : "text-muted-foreground")} href={item.href}>
                <Icon aria-hidden="true" className="size-5" />{item.mobileLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function StudentShell({ children, user }: { children: ReactNode; user: { name: string } }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="sticky top-0 hidden h-screen lg:block"><StudentSidebar /></div>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Fechar menu" className="absolute inset-0 bg-foreground/40" onClick={() => setMenuOpen(false)} type="button" />
          <div className="relative h-full w-[min(16rem,86vw)] shadow-2xl"><StudentSidebar mobile onClose={() => setMenuOpen(false)} /></div>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
          <Button aria-label="Abrir menu" className="lg:hidden" onClick={() => setMenuOpen(true)} size="icon" variant="ghost"><Menu aria-hidden="true" /></Button>
          <NovaLogo className="w-28 lg:hidden" href="/student" priority />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link aria-label="Abrir perfil" className="nova-focus grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary" href="/student/profile">{initials(user.name)}</Link>
            <div className="hidden min-w-0 sm:block"><p className="max-w-40 truncate text-sm font-semibold">{user.name}</p><p className="text-xs text-[var(--nova-success)]">Estudante</p></div>
            <LogoutButton className="hidden sm:flex" />
          </div>
        </header>
        <main className="min-h-[calc(100vh-5rem)] pb-24 lg:pb-0">{children}</main>
      </div>
      <MobileNavigation />
    </div>
  );
}

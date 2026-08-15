"use client";

import { BookOpen, FileQuestion, LayoutDashboard, ListChecks, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NovaLogo } from "@/components/brand/nova-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { exact: true, href: "/admin", icon: LayoutDashboard, label: "Painel geral" },
  { href: "/admin/courses", icon: BookOpen, label: "Cursos" },
  { href: "/admin/questions", icon: FileQuestion, label: "Questões" },
  { href: "/admin/assessments", icon: ListChecks, label: "Avaliações" },
] as const;

export function AdminSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full min-h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-between px-6">
        <div><NovaLogo className="w-32" href="/admin" inverted priority /><p className="mt-1 font-heading text-[0.58rem] font-semibold uppercase text-sidebar-foreground/55">Painel gestor</p></div>
        {mobile ? <Button aria-label="Fechar menu" className="text-white hover:bg-white/10 hover:text-white" onClick={onClose} size="icon" variant="ghost"><X aria-hidden="true" /></Button> : null}
      </div>
      <nav aria-label="Navegação administrativa" className="flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <p className="mb-3 px-4 text-[0.65rem] font-semibold uppercase text-sidebar-foreground/40">Gestão acadêmica</p>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return <li key={item.href}><Link aria-current={active ? "page" : undefined} className={cn("nova-focus flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition-colors", active ? "bg-primary text-white shadow-[0_8px_24px_rgb(91_63_196/24%)]" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white")} href={item.href} onClick={onClose}><Icon aria-hidden="true" className="size-5" />{item.label}</Link></li>;
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/45">© NOVA</div>
    </aside>
  );
}

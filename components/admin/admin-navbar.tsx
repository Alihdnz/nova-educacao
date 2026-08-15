"use client";

import { Menu } from "lucide-react";

import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { LogoutButton } from "@/components/auth/logout-button";
import { NovaLogo } from "@/components/brand/nova-logo";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function AdminNavbar({ onOpenMenu, user }: { onOpenMenu: () => void; user: { email: string; name: string } }) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
      <Button aria-label="Abrir menu" className="lg:hidden" onClick={onOpenMenu} size="icon" title="Abrir menu" type="button" variant="ghost">
        <Menu aria-hidden="true" />
      </Button>
      <NovaLogo className="w-24 lg:hidden" href="/admin" />
      <div className="hidden min-w-0 flex-1 lg:block"><AdminBreadcrumbs /></div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(user.name)}</span>
        <div className="hidden min-w-0 md:block">
          <p className="max-w-48 truncate text-sm font-semibold">{user.name}</p>
          <p className="max-w-48 truncate text-xs text-[var(--nova-success)]">Administrador</p>
        </div>
        <LogoutButton className="hidden sm:flex" />
      </div>
    </header>
  );
}

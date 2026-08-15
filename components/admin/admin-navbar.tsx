"use client";

import { Menu } from "lucide-react";

import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

type AdminNavbarProps = {
  onOpenMenu: () => void;
  user: {
    email: string;
    name: string;
  };
};

export function AdminNavbar({ onOpenMenu, user }: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Button
        aria-label="Abrir menu"
        className="lg:hidden"
        onClick={onOpenMenu}
        size="icon"
        title="Abrir menu"
        type="button"
        variant="ghost"
      >
        <Menu aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1 overflow-hidden">
        <AdminBreadcrumbs />
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden min-w-0 text-right md:block">
          <p className="max-w-48 truncate text-sm font-medium">{user.name}</p>
          <p className="max-w-48 truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}

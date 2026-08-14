"use client";

import { type ReactNode, useEffect, useState } from "react";

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
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="sticky top-0 hidden h-screen lg:block">
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
          <div className="relative h-full w-[min(15rem,85vw)] shadow-xl">
            <AdminSidebar mobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="min-w-0">
        <AdminNavbar onOpenMenu={() => setMenuOpen(true)} user={user} />
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

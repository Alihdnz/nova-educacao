"use client";

import { Menu, UserPlus, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NovaLogo } from "@/components/brand/nova-logo";
import { Container } from "@/components/layout/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Início" },
  { href: "/courses", label: "Cursos" },
  { href: "/how-it-works", label: "Como funciona" },
  { href: "/about", label: "Sobre nós" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgb(3_8_28/88%)] backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-4 py-3">
        <NovaLogo className="w-28 sm:w-32" href="/" inverted priority />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {navigation.map((item) => (
            <Link
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "nova-focus rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-white/8 text-white"
                  : "text-white/70 hover:bg-white/6 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className={buttonVariants({
              className: "hidden bg-white/8 text-white hover:bg-white/14 hover:text-white sm:inline-flex",
              variant: "ghost",
            })}
          >
            <UserPlus aria-hidden="true" />
            Cadastre-se
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              className:
                "border-cyan-400/70 bg-transparent text-white hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-white",
              variant: "outline",
            })}
          >
            <UserRound aria-hidden="true" />
            <span className="hidden sm:inline">Login do Aluno</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
          <Button
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="text-white hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setOpen((current) => !current)}
            size="icon"
            variant="ghost"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </Container>

      {open ? (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden" aria-label="Navegação móvel">
          <ul className="mx-auto grid max-w-6xl gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "nova-focus block rounded-lg px-4 py-3 text-sm font-semibold",
                    pathname === item.href ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/6 hover:text-white",
                  )}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="nova-focus flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-white/6" href="/register" onClick={() => setOpen(false)}>
                <UserPlus aria-hidden="true" className="size-4" />
                Cadastre-se
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

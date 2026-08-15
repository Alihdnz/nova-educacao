import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { NovaLogo } from "@/components/brand/nova-logo";
import { Container } from "@/components/layout/container";

const footerLinks = [
  { href: "/courses", label: "Cursos" },
  { href: "/how-it-works", label: "Como funciona" },
  { href: "/about", label: "Sobre nós" },
  { href: "/login", label: "Acesso do aluno" },
  { href: "/register", label: "Cadastre-se" },
  { href: "/terms", label: "Termos de Uso" },
  { href: "/privacy", label: "Privacidade" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020615] py-10 text-white/65">
      <Container className="grid gap-9 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <NovaLogo className="w-28" href="/" inverted />
          <p className="mt-4 max-w-sm text-sm leading-6">
            Conhecimento que move você. Cursos livres para aprender com autonomia e propósito.
          </p>
        </div>
        <nav aria-label="Links do rodapé">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link className="nova-focus rounded text-white/70 transition-colors hover:text-cyan-300" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="mt-9 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} NOVA Educação. Todos os direitos reservados.</p>
        <Link
          className="nova-focus inline-flex w-fit items-center gap-2 rounded text-white/50 transition-colors hover:text-white"
          href="/login?role=admin"
        >
          <LockKeyhole aria-hidden="true" className="size-3.5" />
          Acesso do gestor
        </Link>
      </Container>
    </footer>
  );
}

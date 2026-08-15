import { BookOpenCheck, Compass, UsersRound } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = { description: "Conheça a proposta da NOVA Educação.", title: "Sobre nós" };

const principles = [
  { description: "Conteúdos organizados para tornar o próximo passo sempre claro.", icon: Compass, title: "Direção" },
  { description: "Cursos livres para diferentes áreas de conhecimento e momentos de carreira.", icon: BookOpenCheck, title: "Amplitude" },
  { description: "Uma experiência que respeita o ritmo e o progresso de cada estudante.", icon: UsersRound, title: "Autonomia" },
] as const;

export default function AboutPage() {
  return (
    <Container className="py-14 sm:py-18">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Sobre a NOVA</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Conhecimento que acompanha o seu movimento</h1>
        <p className="mt-5 text-base leading-8 text-white/60">A NOVA Educação é uma plataforma de cursos livres criada para conectar conteúdo estruturado, autonomia de estudo e acompanhamento de progresso em uma experiência simples.</p>
      </header>
      <section className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3" aria-label="Princípios da NOVA">
        {principles.map((principle) => {
          const Icon = principle.icon;
          return <article className="bg-[#03081c] p-6" key={principle.title}><Icon aria-hidden="true" className="size-7 text-cyan-300" /><h2 className="mt-5 text-lg font-semibold text-white">{principle.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{principle.description}</p></article>;
        })}
      </section>
    </Container>
  );
}

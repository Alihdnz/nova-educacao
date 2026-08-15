import { ArrowRight, BookOpen, ChartNoAxesCombined, LogIn, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { description: "Entenda como estudar e acompanhar seu progresso na NOVA Educação.", title: "Como funciona" };

const steps = [
  { description: "Consulte os cursos publicados e veja a estrutura disponível.", icon: BookOpen, title: "Explore o catálogo" },
  { description: "Entre com as credenciais fornecidas pela plataforma.", icon: LogIn, title: "Acesse sua conta" },
  { description: "Avance por disciplinas, módulos, aulas e avaliações.", icon: PlayCircle, title: "Aprenda no seu ritmo" },
  { description: "Veja aulas concluídas, resultados e evolução por curso.", icon: ChartNoAxesCombined, title: "Acompanhe o progresso" },
] as const;

export default function HowItWorksPage() {
  return (
    <Container className="py-14 sm:py-18">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Jornada de aprendizagem</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Como funciona a experiência NOVA</h1>
        <p className="mt-5 text-base leading-8 text-white/60">Da escolha do curso ao acompanhamento dos resultados, cada etapa foi organizada para manter foco e clareza.</p>
      </header>
      <ol className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="Etapas da jornada">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return <li className="rounded-lg border border-white/10 bg-white/[0.035] p-6" key={step.title}><div className="flex items-center justify-between"><Icon aria-hidden="true" className="size-7 text-cyan-300" /><span className="text-sm font-bold text-violet-300">0{index + 1}</span></div><h2 className="mt-6 text-lg font-semibold text-white">{step.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{step.description}</p></li>;
        })}
      </ol>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link className={buttonVariants({ className: "nova-gradient-cta text-white hover:brightness-110", size: "lg" })} href="/courses">Explorar cursos<ArrowRight aria-hidden="true" /></Link>
        <Link className={buttonVariants({ className: "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white", size: "lg", variant: "outline" })} href="/login">Login do aluno</Link>
      </div>
    </Container>
  );
}

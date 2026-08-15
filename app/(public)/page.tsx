import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Clock3,
  Code2,
  Lightbulb,
  Palette,
  Play,
  Route,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PublicCourseCard } from "@/components/public/public-course-card";
import { buttonVariants } from "@/components/ui/button";
import { getPublicCourses } from "@/lib/public-courses";

export const metadata: Metadata = {
  description: "Plataforma de cursos livres para aprender no seu ritmo e desenvolver conhecimentos para o futuro.",
  title: { absolute: "NOVA Educação — Conhecimento que move você" },
};

const features = [
  { description: "Conteúdos práticos organizados em jornadas claras.", icon: BookOpenCheck, title: "Cursos livres" },
  { description: "Estude de onde estiver e avance no seu próprio ritmo.", icon: Clock3, title: "Flexibilidade" },
  { description: "Aulas, módulos e avaliações conectados em um só lugar.", icon: Route, title: "Aprendizado estruturado" },
  { description: "Acompanhe aulas concluídas e resultados das avaliações.", icon: ChartNoAxesCombined, title: "Progresso real" },
] as const;

const knowledgeAreas = [
  { icon: BriefcaseBusiness, label: "Negócios" },
  { icon: ChartNoAxesCombined, label: "Finanças" },
  { icon: Code2, label: "Tecnologia" },
  { icon: Palette, label: "Design" },
  { icon: Lightbulb, label: "Desenvolvimento pessoal" },
] as const;

export default async function Home() {
  const courses = await getPublicCourses();
  const featuredCourses = courses.slice(0, 3);

  return (
    <>
      <section className="nova-public-hero relative border-b border-white/10" aria-labelledby="hero-title">
        <Container className="relative flex min-h-[calc(100svh-8rem)] items-start py-12 sm:min-h-[calc(100svh-9rem)] sm:items-center lg:min-h-[calc(100svh-10rem)] lg:py-16">
          <div className="nova-reveal relative z-10 max-w-2xl lg:max-w-[44rem]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-sm">
              NOVA · Plataforma de cursos livres
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Conhecimento que <span className="text-cyan-300">move</span> você.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Aprenda no seu ritmo com cursos práticos, conteúdos organizados e uma experiência feita para transformar estudo em desenvolvimento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className={buttonVariants({ className: "nova-gradient-cta h-12 px-6 text-white shadow-[0_16px_40px_rgb(53_104_255/24%)] hover:brightness-110", size: "lg" })} href="/courses">
                Explorar cursos
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className={buttonVariants({ className: "h-12 border-violet-400/45 bg-transparent px-6 text-white hover:bg-violet-400/10 hover:text-white", size: "lg", variant: "outline" })} href="/how-it-works">
                <Play aria-hidden="true" />
                Como funciona
              </Link>
            </div>
          </div>

          <div className="nova-reveal nova-reveal-delay pointer-events-none absolute -bottom-4 right-2 w-60 sm:bottom-2 sm:right-6 sm:w-[42vw] sm:max-w-[28rem] lg:bottom-8 lg:right-4 lg:max-w-[31rem]" aria-hidden="true">
            <div className="relative aspect-square">
              <Image alt="" className="object-contain drop-shadow-[0_0_34px_rgb(34_211_238/32%)]" fill priority sizes="(max-width: 1024px) 80vw, 38vw" src="/assets/icon.png" />
            </div>
            <div className="mx-auto -mt-10 h-9 w-[78%] rounded-[50%] border border-cyan-300/30 bg-[#071c56] shadow-[0_0_35px_rgb(34_211_238/28%),0_18px_30px_rgb(0_0_0/55%)] sm:-mt-14 sm:h-12" />
          </div>
        </Container>
      </section>

      <section className="border-b border-white/10 bg-[#050a20] py-8 sm:py-16" id="how-it-works" aria-labelledby="features-title">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Experiência NOVA</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl" id="features-title">Tudo o que você precisa para aprender melhor</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="bg-[#050a20] p-6 text-center" key={feature.title}>
                  <Icon aria-hidden="true" className="mx-auto size-8 text-cyan-300" />
                  <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/10 bg-[#03081c] py-16" aria-labelledby="areas-title">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Explore possibilidades</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl" id="areas-title">Áreas de conhecimento</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/55">As áreas abaixo apresentam a amplitude da plataforma. Consulte o catálogo para conhecer os cursos atualmente publicados.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {knowledgeAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Link className="nova-focus group flex min-h-28 flex-col justify-between rounded-lg border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]" href="/courses" key={area.label}>
                  <Icon aria-hidden="true" className="size-6 text-violet-300 transition-colors group-hover:text-cyan-300" />
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-white">{area.label}<ArrowRight aria-hidden="true" className="size-4 text-white/35" /></span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-[#020615] py-16 sm:py-20" aria-labelledby="featured-title">
        <Container>
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Catálogo publicado</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl" id="featured-title">Cursos em destaque</h2>
            </div>
            <Link className="nova-focus hidden items-center gap-2 rounded text-sm font-semibold text-cyan-300 hover:text-cyan-200 sm:inline-flex" href="/courses">Ver todos os cursos<ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => <PublicCourseCard course={course} key={course.id} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.035] px-6 py-12 text-center">
              <Sparkles aria-hidden="true" className="mx-auto size-8 text-cyan-300" />
              <h3 className="mt-4 font-semibold text-white">Novos cursos em preparação</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">Os cursos publicados pela equipe NOVA aparecerão aqui.</p>
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link className={buttonVariants({ className: "w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white", variant: "outline" })} href="/courses">Ver todos os cursos<ArrowRight aria-hidden="true" /></Link>
          </div>

          <section className="nova-final-cta mt-14 grid gap-6 rounded-lg border border-cyan-300/20 px-6 py-8 sm:px-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" aria-labelledby="final-cta-title">
            <div>
              <h2 className="text-xl font-semibold text-white sm:text-2xl" id="final-cta-title">Pronto para começar sua jornada?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Acesse sua conta e continue aprendendo com a NOVA Educação.</p>
            </div>
            <Link className={buttonVariants({ className: "nova-gradient-cta h-11 px-6 text-white hover:brightness-110", size: "lg" })} href="/login">Comece agora<ArrowRight aria-hidden="true" /></Link>
          </section>
        </Container>
      </section>
    </>
  );
}

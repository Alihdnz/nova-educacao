import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PublicCourseCard } from "@/components/public/public-course-card";
import { getPublicCourses } from "@/lib/public-courses";

export const metadata: Metadata = {
  description: "Conheça os cursos livres publicados na plataforma NOVA Educação.",
  title: "Cursos livres",
};

export default async function PublicCoursesPage() {
  const courses = await getPublicCourses();

  return (
    <Container className="py-14 sm:py-18">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Catálogo NOVA</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Cursos livres para novos caminhos</h1>
        <p className="mt-4 text-base leading-7 text-white/60">Explore os cursos publicados e conheça a estrutura de disciplinas, módulos e aulas antes de entrar na plataforma.</p>
      </header>

      {courses.length > 0 ? (
        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Cursos publicados">
          {courses.map((course) => <PublicCourseCard course={course} key={course.id} />)}
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-white/10 bg-white/[0.035] px-6 py-14 text-center">
          <BookOpen aria-hidden="true" className="mx-auto size-9 text-cyan-300" />
          <h2 className="mt-4 text-lg font-semibold text-white">Nenhum curso publicado</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">Assim que a equipe publicar um curso, ele estará disponível neste catálogo.</p>
        </section>
      )}
    </Container>
  );
}

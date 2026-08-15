import { ArrowLeft, ArrowRight, BookOpen, Layers3, LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { getPublicCourse, publicCourseLessonCount } from "@/lib/public-courses";

type Props = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);
  if (!course) return { title: "Curso não encontrado" };
  return { description: course.description || `Conheça o curso ${course.title} na NOVA Educação.`, title: course.title };
}

export default async function PublicCoursePage({ params }: Props) {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);
  if (!course) notFound();

  const lessonCount = publicCourseLessonCount(course);
  const moduleCount = course.subjects.reduce((total, subject) => total + subject.modules.length, 0);

  return (
    <Container className="py-10 sm:py-14">
      <Link className="nova-focus inline-flex items-center gap-2 rounded text-sm font-semibold text-cyan-300 hover:text-cyan-200" href="/courses"><ArrowLeft aria-hidden="true" className="size-4" />Voltar aos cursos</Link>

      <header className="mt-8 grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Curso livre · NOVA</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{course.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">{course.description || "Conteúdo estruturado em disciplinas, módulos e aulas para uma jornada progressiva de aprendizagem."}</p>
          <dl className="mt-6 flex flex-wrap gap-5 text-sm text-white/60">
            <div className="inline-flex items-center gap-2"><Layers3 aria-hidden="true" className="size-4 text-violet-300" /><dt className="sr-only">Disciplinas</dt><dd>{course.subjects.length} disciplina(s)</dd></div>
            <div className="inline-flex items-center gap-2"><BookOpen aria-hidden="true" className="size-4 text-cyan-300" /><dt className="sr-only">Módulos e aulas</dt><dd>{moduleCount} módulo(s) · {lessonCount} aula(s)</dd></div>
          </dl>
          <Link className={buttonVariants({ className: "nova-gradient-cta mt-7 text-white hover:brightness-110", size: "lg" })} href="/login">Entrar para acessar<ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/12 bg-[linear-gradient(135deg,#07142d,#15285a_55%,#5521a8)]">
          {course.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={course.coverImageUrl} />
          ) : <div className="grid h-full place-items-center"><BookOpen aria-hidden="true" className="size-16 text-cyan-300/65" /></div>}
        </div>
      </header>

      <section className="py-10" aria-labelledby="outline-title">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-white" id="outline-title">Estrutura do curso</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">Uma visão pública da organização do curso. O conteúdo das aulas permanece protegido.</p>
        </div>
        {course.subjects.length > 0 ? (
          <div className="mt-7 overflow-hidden rounded-lg border border-white/10">
            {course.subjects.map((subject) => (
              <article className="border-b border-white/10 bg-white/[0.035] p-5 last:border-b-0 sm:p-6" key={subject.id}>
                <div className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-400/15 text-sm font-bold text-violet-200">{subject.order}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white">{subject.title}</h3>
                    {subject.description ? <p className="mt-1 text-sm leading-6 text-white/50">{subject.description}</p> : null}
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {subject.modules.map((module) => (
                        <li className="flex items-center justify-between gap-3 rounded-md border border-white/8 bg-black/15 px-3 py-2.5 text-sm text-white/65" key={module.id}>
                          <span className="truncate">{module.title}</span>
                          <span className="shrink-0 text-xs text-white/40">{module.lessons.length} aula(s)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="mt-7 rounded-lg border border-white/10 bg-white/[0.035] p-6 text-sm text-white/55">A estrutura publicada deste curso ainda está sendo preparada.</p>}
      </section>

      <aside className="mb-4 flex gap-3 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.055] p-5 text-sm leading-6 text-white/60">
        <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cyan-300" />
        <p>As aulas, avaliações e resultados são acessíveis somente a estudantes autenticados e matriculados no curso.</p>
      </aside>
    </Container>
  );
}

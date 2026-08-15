import { ArrowRight, BookOpen, Layers3 } from "lucide-react";
import Link from "next/link";

import { publicCourseLessonCount, type PublicCourse } from "@/lib/public-courses";

export function PublicCourseCard({ course }: { course: PublicCourse }) {
  const lessons = publicCourseLessonCount(course);

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-white/12 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.065]">
      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#07142d,#172d63_55%,#5b21b6)]">
        {course.coverImageUrl ? (
          // Course cover URLs are managed content and may come from different approved hosts.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" src={course.coverImageUrl} />
        ) : (
          <div className="grid h-full place-items-center">
            <BookOpen aria-hidden="true" className="size-12 text-cyan-300/70" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-md border border-cyan-300/25 bg-[#041029]/85 px-2.5 py-1 text-xs font-semibold text-cyan-200 backdrop-blur">
          Curso livre
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">
          {course.description || "Conteúdo organizado para uma jornada de aprendizagem clara e progressiva."}
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/55">
          <span className="inline-flex items-center gap-1.5"><Layers3 aria-hidden="true" className="size-3.5" />{course.subjects.length} disciplina(s)</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen aria-hidden="true" className="size-3.5" />{lessons} aula(s)</span>
        </div>
        <Link className="nova-focus mt-5 inline-flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/10" href={`/courses/${course.id}`}>
          Ver curso
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

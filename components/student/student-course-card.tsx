/* eslint-disable @next/next/no-img-element -- course covers use administrator-provided remote URLs */

import { ArrowRight, BookOpen, Play } from "lucide-react";
import Link from "next/link";

import { StudentProgressBar } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudentCourseProgress } from "@/lib/student-progress";
import { formatPercentage } from "@/lib/student-progress-calculation";
import { studentCoursePath } from "@/lib/student-learning";

export function StudentCourseCard({ course }: { course: StudentCourseProgress }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid sm:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="min-h-36 bg-muted">
          {course.course.coverImageUrl ? <img alt="" className="h-full w-full object-cover" loading="lazy" src={course.course.coverImageUrl} /> : <div className="grid h-full place-items-center text-primary"><BookOpen aria-hidden="true" className="size-8" /></div>}
        </div>
        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0"><p className="text-xs font-semibold text-primary">{course.isCompleted ? "CONCLUÍDO" : "EM ANDAMENTO"}</p><h3 className="mt-1 truncate font-heading text-base font-semibold">{course.course.title}</h3></div>
            <span className={course.isCompleted ? "rounded-full bg-accent/12 px-2 py-1 text-xs font-semibold text-[var(--nova-success)]" : "rounded-full bg-primary/8 px-2 py-1 text-xs font-semibold text-primary"}>{formatPercentage(course.lessonProgress.percentage)}</span>
          </div>
          <div className="mt-4"><StudentProgressBar {...course.lessonProgress} /></div>
          <p className="mt-4 truncate text-xs text-muted-foreground">{course.continuation ? `Próxima: ${course.continuation.title}` : `${course.modulesCompleted} de ${course.modulesTotal} módulos`}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className={buttonVariants({ variant: "outline" })} href={studentCoursePath(course.course.id)}>Ver curso<ArrowRight aria-hidden="true" /></Link>
            {course.continuation ? <Link className={buttonVariants()} href={course.continuation.href}><Play aria-hidden="true" />Continuar</Link> : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

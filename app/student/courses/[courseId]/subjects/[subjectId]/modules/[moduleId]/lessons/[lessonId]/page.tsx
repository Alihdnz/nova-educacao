/* eslint-disable @next/next/no-img-element -- lesson media uses administrator-provided remote URLs */

import { ArrowLeft, ArrowRight, ClipboardCheck, Clock3, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { completeLessonAction } from "@/app/student/lesson-actions";
import { LessonContentRenderer } from "@/components/content/lesson-content-renderer";
import { Container } from "@/components/layout/container";
import { CompleteLessonForm } from "@/components/student/complete-lesson-form";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { LessonProgressBadge } from "@/components/student/student-progress";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { ProgressStatus, UserRole } from "@/lib/generated/prisma/client";
import { studentAssessmentPath } from "@/lib/student-assessment";
import {
  getStudentLesson,
  lessonHref,
  lessonStatus,
  progressMap,
  studentCoursePath,
  studentModulePath,
  studentSubjectPath,
} from "@/lib/student-learning";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Aula" };

export default async function StudentLessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string; moduleId: string; subjectId: string }> }) {
  const [{ courseId, lessonId, moduleId, subjectId }, session] = await Promise.all([params, requireRole(UserRole.STUDENT)]);
  const enrollment = await getStudentLesson(session.user.id, courseId, subjectId, moduleId, lessonId);
  const subject = enrollment?.course.subjects[0];
  const courseModule = subject?.modules[0];
  const lesson = courseModule?.lessons[0];
  if (!enrollment || !subject || !courseModule || !lesson) notFound();

  const status = lessonStatus(lesson.id, progressMap(enrollment.progresses));
  const currentIndex = enrollment.navigationLessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = currentIndex > 0 ? enrollment.navigationLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < enrollment.navigationLessons.length - 1 ? enrollment.navigationLessons[currentIndex + 1] : null;
  const completeAction = completeLessonAction.bind(null, courseId, subjectId, moduleId, lessonId);

  return (
    <Container className="max-w-[100rem] space-y-5 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Dashboard" }, { href: studentCoursePath(courseId), label: enrollment.course.title }, { href: studentSubjectPath(courseId, subjectId), label: subject.title }, { href: studentModulePath(courseId, subjectId, moduleId), label: courseModule.title }, { label: lesson.title }]} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <article className="min-w-0 space-y-5">
          <header>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2"><LessonProgressBadge status={status} /><span className="text-sm font-medium text-muted-foreground">{courseModule.title}</span></div>
              <CompleteLessonForm action={completeAction} completed={status === ProgressStatus.COMPLETED} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{lesson.order}. {lesson.title}</h1>
            {lesson.description ? <p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">{lesson.description}</p> : null}
            <nav aria-label="Navegação entre aulas" className="mt-5 flex flex-wrap justify-end gap-2">
              {previousLesson ? <Link className={buttonVariants({ variant: "outline" })} href={lessonHref(courseId, previousLesson)}><ArrowLeft aria-hidden="true" />Aula anterior</Link> : null}
              {nextLesson ? <Link className={buttonVariants({ variant: "outline" })} href={lessonHref(courseId, nextLesson)}>Próxima aula<ArrowRight aria-hidden="true" /></Link> : null}
            </nav>
          </header>

          {lesson.imageUrl ? <div className="aspect-video max-h-[42rem] overflow-hidden rounded-lg bg-sidebar shadow-[var(--nova-shadow-md)]"><img alt={`Imagem da aula ${lesson.title}`} className="h-full w-full object-cover" src={lesson.imageUrl} /></div> : null}

          <Card>
            <CardHeader className="border-b pb-4"><div className="flex gap-6 overflow-x-auto text-sm font-semibold"><span className="whitespace-nowrap border-b-2 border-primary pb-3 text-primary">Sobre a aula</span><span className="whitespace-nowrap pb-3 text-muted-foreground">Conteúdo</span><span className="whitespace-nowrap pb-3 text-muted-foreground">Avaliações ({lesson.assessments.length})</span></div></CardHeader>
            <CardContent className="prose-nova">
              {lesson.content ? <LessonContentRenderer content={lesson.content} /> : <p className="text-sm text-muted-foreground">Esta aula ainda não possui conteúdo textual.</p>}
            </CardContent>
          </Card>

          {lesson.assessments.length > 0 ? (
            <section className="space-y-4" aria-labelledby="assessments-title">
              <div><h2 className="text-xl font-semibold" id="assessments-title">Exercícios e avaliações</h2><p className="mt-1 text-sm text-muted-foreground">Atividades publicadas vinculadas a esta aula.</p></div>
              <Card className="divide-y overflow-hidden">
                {lesson.assessments.map((assessment) => (
                  <article className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={assessment.id}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary"><ClipboardCheck aria-hidden="true" className="size-5" /></span>
                    <div className="min-w-0 flex-1"><h3 className="font-heading font-semibold">{assessment.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{assessment.description || "Sem instruções adicionais."}</p><div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>Nota {assessment.maxScore.toString()}</span><span>Aprovação {assessment.passingPercentage.toString()}%</span><span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" />{assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} min` : "Sem limite"}</span></div></div>
                    <Link className={buttonVariants()} href={studentAssessmentPath({ assessmentId: assessment.id, courseId, lessonId, moduleId, subjectId })}>Abrir avaliação<ArrowRight aria-hidden="true" /></Link>
                  </article>
                ))}
              </Card>
            </section>
          ) : null}

          <footer><Link className={buttonVariants({ variant: "ghost" })} href={studentModulePath(courseId, subjectId, moduleId)}><ArrowLeft aria-hidden="true" />Voltar ao módulo</Link></footer>
        </article>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="border-b pb-4"><div className="flex items-center justify-between gap-4"><h2 className="text-base font-semibold">Aulas do curso</h2><span className="text-xs font-semibold text-primary">{enrollment.navigationLessons.length} aulas</span></div></CardHeader>
            <div className="max-h-[36rem] divide-y overflow-y-auto">
              {enrollment.navigationLessons.map((item, index) => {
                const current = item.id === lesson.id;
                return (
                  <Link aria-current={current ? "page" : undefined} className={cn("nova-focus flex gap-3 p-4 transition-colors hover:bg-muted", current && "border-l-2 border-primary bg-primary/5")} href={lessonHref(courseId, item)} key={item.id}>
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", current ? "bg-primary text-white" : "bg-muted text-muted-foreground")}><PlayCircle aria-hidden="true" className="size-4" /></span>
                    <span className="min-w-0"><span className="block text-xs text-muted-foreground">Aula {index + 1}</span><span className={cn("mt-1 block text-sm", current ? "font-semibold text-foreground" : "text-muted-foreground")}>{item.title}</span></span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

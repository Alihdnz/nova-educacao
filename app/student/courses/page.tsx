import { BookOpenCheck } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentBreadcrumbs } from "@/components/student/student-breadcrumbs";
import { StudentCourseCard } from "@/components/student/student-course-card";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { UserRole } from "@/lib/generated/prisma/client";
import { getStudentProgressDashboard } from "@/lib/student-progress";

export const metadata: Metadata = { title: "Meus cursos" };

export default async function StudentCoursesPage() {
  const session = await requireRole(UserRole.STUDENT);
  const dashboard = await getStudentProgressDashboard(session.user.id);

  return (
    <Container className="max-w-[96rem] space-y-7 py-6 sm:py-8">
      <StudentBreadcrumbs items={[{ href: "/student", label: "Início" }, { label: "Meus cursos" }]} />
      <header><p className="text-sm font-semibold text-primary">Aprendizagem</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Meus cursos</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Acesse seus cursos matriculados e continue da próxima aula disponível.</p></header>
      {dashboard.courses.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2" aria-label="Cursos matriculados">
          {dashboard.courses.map((course) => <StudentCourseCard course={course} key={course.enrollmentId} />)}
        </section>
      ) : <Card><EmptyState description="Quando uma matrícula for disponibilizada para sua conta, o curso aparecerá aqui." icon={BookOpenCheck} title="Você ainda não possui cursos matriculados" /></Card>}
    </Container>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createSubjectAction } from "@/app/admin/courses/actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChildStructureForm } from "@/components/admin/structure-form-fields";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nova disciplina" };

export default async function NewSubjectPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { _count: { select: { subjects: true } }, id: true, title: true },
  });
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${course.id}`, label: course.title },
          { label: "Nova disciplina" },
        ]}
      />
      <AdminPageHeader
        description={`A disciplina será vinculada exclusivamente ao curso ${course.title}.`}
        eyebrow="Disciplinas"
        title="Nova disciplina"
      />
      <ChildStructureForm
        action={createSubjectAction.bind(null, course.id)}
        cancelHref={`/admin/courses/${course.id}`}
        entityLabel="disciplina"
        maximumOrder={course._count.subjects + 1}
        submitLabel="Criar disciplina"
      />
    </div>
  );
}

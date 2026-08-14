import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateSubjectAction } from "@/app/admin/courses/actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChildStructureForm } from "@/components/admin/structure-form-fields";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar disciplina" };

export default async function EditSubjectPage({
  params,
}: {
  params: Promise<{ courseId: string; subjectId: string }>;
}) {
  const { courseId, subjectId } = await params;
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, courseId },
    select: {
      course: { select: { id: true, title: true } },
      description: true,
      id: true,
      order: true,
      slug: true,
      status: true,
      title: true,
    },
  });
  if (!subject) notFound();
  const count = await prisma.subject.count({ where: { courseId } });

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: subject.course.title },
          { label: subject.title },
          { label: "Editar" },
        ]}
      />
      <AdminPageHeader
        description={`Atualize a disciplina vinculada ao curso ${subject.course.title}.`}
        eyebrow="Disciplinas"
        title={`Editar ${subject.title}`}
      />
      <ChildStructureForm
        action={updateSubjectAction.bind(null, courseId, subject.id)}
        cancelHref={`/admin/courses/${courseId}`}
        defaults={subject}
        entityLabel="disciplina"
        maximumOrder={count}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}

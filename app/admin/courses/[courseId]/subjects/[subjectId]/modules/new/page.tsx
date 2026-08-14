import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createModuleAction } from "@/app/admin/courses/actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChildStructureForm } from "@/components/admin/structure-form-fields";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Novo módulo" };

export default async function NewModulePage({
  params,
}: {
  params: Promise<{ courseId: string; subjectId: string }>;
}) {
  const { courseId, subjectId } = await params;
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, courseId },
    select: {
      _count: { select: { modules: true } },
      course: { select: { title: true } },
      id: true,
      title: true,
    },
  });
  if (!subject) notFound();
  const base = `/admin/courses/${courseId}/subjects/${subject.id}/modules`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: subject.course.title },
          { href: base, label: subject.title },
          { label: "Novo módulo" },
        ]}
      />
      <AdminPageHeader
        description={`O módulo será vinculado exclusivamente à disciplina ${subject.title}.`}
        eyebrow="Módulos"
        title="Novo módulo"
      />
      <ChildStructureForm
        action={createModuleAction.bind(null, courseId, subject.id)}
        cancelHref={base}
        entityLabel="módulo"
        maximumOrder={subject._count.modules + 1}
        submitLabel="Criar módulo"
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateModuleAction } from "@/app/admin/courses/actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChildStructureForm } from "@/components/admin/structure-form-fields";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar módulo" };

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; subjectId: string }>;
}) {
  const { courseId, moduleId, subjectId } = await params;
  const courseModule = await prisma.module.findFirst({
    where: { id: moduleId, subjectId, subject: { courseId } },
    select: {
      description: true,
      id: true,
      order: true,
      slug: true,
      status: true,
      subject: {
        select: { course: { select: { title: true } }, id: true, title: true },
      },
      title: true,
    },
  });
  if (!courseModule) notFound();
  const count = await prisma.module.count({
    where: { subjectId, subject: { courseId } },
  });
  const base = `/admin/courses/${courseId}/subjects/${subjectId}/modules`;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${courseId}`, label: courseModule.subject.course.title },
          { href: base, label: courseModule.subject.title },
          { label: courseModule.title },
          { label: "Editar" },
        ]}
      />
      <AdminPageHeader
        description={`Atualize o módulo vinculado à disciplina ${courseModule.subject.title}.`}
        eyebrow="Módulos"
        title={`Editar ${courseModule.title}`}
      />
      <ChildStructureForm
        action={updateModuleAction.bind(null, courseId, subjectId, courseModule.id)}
        cancelHref={base}
        defaults={courseModule}
        entityLabel="módulo"
        maximumOrder={count}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}

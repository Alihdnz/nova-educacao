import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateCourseAction } from "@/app/admin/courses/actions";
import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseForm } from "@/components/admin/structure-form-fields";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar curso" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      coverImageUrl: true,
      description: true,
      id: true,
      slug: true,
      status: true,
      title: true,
    },
  });
  if (!course) notFound();
  const action = updateCourseAction.bind(null, course.id);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { href: `/admin/courses/${course.id}`, label: course.title },
          { label: "Editar" },
        ]}
      />
      <AdminPageHeader
        description="Atualize os dados do curso sem alterar seus vínculos."
        eyebrow="Cursos"
        title={`Editar ${course.title}`}
      />
      <CourseForm
        action={action}
        cancelHref={`/admin/courses/${course.id}`}
        defaults={course}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}

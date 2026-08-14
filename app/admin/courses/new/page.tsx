import type { Metadata } from "next";

import { AdminBreadcrumbTrail } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseForm } from "@/components/admin/structure-form-fields";
import { createCourseAction } from "@/app/admin/courses/actions";

export const metadata: Metadata = { title: "Novo curso" };

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumbTrail
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Cursos" },
          { label: "Novo curso" },
        ]}
      />
      <AdminPageHeader
        description="Cadastre os dados estruturais do curso. Disciplinas serão adicionadas depois."
        eyebrow="Cursos"
        title="Novo curso"
      />
      <CourseForm
        action={createCourseAction}
        cancelHref="/admin/courses"
        submitLabel="Criar curso"
      />
    </div>
  );
}

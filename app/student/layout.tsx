import type { ReactNode } from "react";

import { StudentShell } from "@/components/student/student-shell";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/auth-guards";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(UserRole.STUDENT);

  return <StudentShell user={{ name: session.user.name }}>{children}</StudentShell>;
}

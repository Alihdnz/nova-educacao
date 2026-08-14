import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth-guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <AdminShell
      user={{
        email: session.user.email,
        name: session.user.name,
      }}
    >
      {children}
    </AdminShell>
  );
}

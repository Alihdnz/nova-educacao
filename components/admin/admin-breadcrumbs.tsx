"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AdminBreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbContextValue = {
  items: AdminBreadcrumbItem[] | null;
  setItems: (items: AdminBreadcrumbItem[] | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function AdminBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AdminBreadcrumbItem[] | null>(null);
  const value = useMemo(() => ({ items, setItems }), [items]);
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function AdminBreadcrumbTrail({ items }: { items: AdminBreadcrumbItem[] }) {
  const context = useContext(BreadcrumbContext);
  const setItems = context?.setItems;
  const serializedItems = JSON.stringify(items);

  useEffect(() => {
    if (!setItems) return;
    setItems(JSON.parse(serializedItems) as AdminBreadcrumbItem[]);
    return () => setItems(null);
  }, [serializedItems, setItems]);

  return null;
}

export function AdminBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  const pathname = usePathname();
  const fallback: AdminBreadcrumbItem[] = pathname.startsWith("/admin/courses")
    ? [
        { href: "/admin", label: "Dashboard" },
        { label: "Cursos" },
      ]
    : [{ label: "Dashboard" }];
  const items = context?.items ?? fallback;

  return (
    <nav className="min-w-0" aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li className="flex min-w-0 items-center gap-1.5" key={`${item.label}-${index}`}>
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              ) : null}
              {!current && item.href ? (
                <Link
                  className="max-w-44 truncate text-muted-foreground hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="max-w-44 truncate font-medium" aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

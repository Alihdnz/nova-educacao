import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type StudentBreadcrumbItem = {
  href?: string;
  label: string;
};

export function StudentBreadcrumbs({ items }: { items: StudentBreadcrumbItem[] }) {
  return (
    <nav className="overflow-x-auto pb-1" aria-label="Breadcrumb">
      <ol className="flex min-w-max items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              ) : null}
              {!current && item.href ? (
                <Link
                  className="max-w-48 truncate text-muted-foreground hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className="max-w-52 truncate font-medium"
                >
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

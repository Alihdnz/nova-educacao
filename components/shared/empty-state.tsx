import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/8 text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="mt-4 font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Archive, Eye, EyeOff, LoaderCircle, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmActionProps = {
  action: () => Promise<void>;
  description: string;
  kind: "archive" | "publish" | "remove" | "unpublish";
  title: string;
};

const labels = {
  archive: "Arquivar",
  publish: "Publicar",
  remove: "Remover",
  unpublish: "Despublicar",
} as const;

function ConfirmSubmit({ kind }: { kind: ConfirmActionProps["kind"] }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={buttonVariants({
        variant: kind === "archive" || kind === "remove" ? "destructive" : "default",
      })}
      disabled={pending}
      type="submit"
    >
      {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
      {pending ? "Salvando..." : `Confirmar ${labels[kind].toLowerCase()}`}
    </button>
  );
}

export function ConfirmAction({ action, description, kind, title }: ConfirmActionProps) {
  const Icon =
    kind === "archive" ? Archive : kind === "remove" ? Trash2 : kind === "publish" ? Eye : EyeOff;

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        className={buttonVariants({
          variant: kind === "archive" || kind === "remove" ? "destructive" : "outline",
        })}
      >
        <Icon aria-hidden="true" />
        {labels[kind]}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[1px]" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup className="w-full max-w-md rounded-lg border bg-background p-6 shadow-xl">
            <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Close className={cn(buttonVariants({ variant: "outline" }))}>
                Cancelar
              </AlertDialog.Close>
              <form action={action}>
                <ConfirmSubmit kind={kind} />
              </form>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

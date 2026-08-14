import { ConfirmAction } from "@/components/admin/confirm-action";
import type { StructureStatus } from "@/lib/course-structure-validation";

type ContentStatusActionsProps = {
  archiveAction: () => Promise<void>;
  entityLabel: string;
  entityTitle: string;
  publishAction: () => Promise<void>;
  status: StructureStatus;
  unpublishAction: () => Promise<void>;
};

export function ContentStatusActions({
  archiveAction,
  entityLabel,
  entityTitle,
  publishAction,
  status,
  unpublishAction,
}: ContentStatusActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {status === "PUBLISHED" ? (
        <ConfirmAction
          action={unpublishAction}
          description={`${entityTitle} voltará para rascunho. Os filhos não terão seus status alterados.`}
          kind="unpublish"
          title={`Despublicar ${entityLabel}?`}
        />
      ) : (
        <ConfirmAction
          action={publishAction}
          description={`${entityTitle} será publicado. Os filhos permanecerão com seus status atuais.`}
          kind="publish"
          title={`Publicar ${entityLabel}?`}
        />
      )}
      {status !== "ARCHIVED" ? (
        <ConfirmAction
          action={archiveAction}
          description={`${entityTitle} será arquivado sem excluir seus vínculos ou conteúdos filhos.`}
          kind="archive"
          title={`Arquivar ${entityLabel}?`}
        />
      ) : null}
    </div>
  );
}

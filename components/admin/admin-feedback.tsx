import { CircleAlert, CircleCheck } from "lucide-react";

const successMessages: Record<string, string> = {
  "course-archived": "Curso arquivado.",
  "course-created": "Curso criado com sucesso.",
  "course-published": "Curso publicado.",
  "course-unpublished": "Curso movido para rascunho.",
  "course-updated": "Curso atualizado com sucesso.",
  "lesson-archived": "Aula arquivada.",
  "lesson-created": "Aula criada como rascunho.",
  "lesson-published": "Aula publicada.",
  "lesson-reordered": "Ordem das aulas atualizada.",
  "lesson-unpublished": "Aula movida para rascunho.",
  "lesson-updated": "Aula atualizada com sucesso.",
  "module-archived": "Módulo arquivado.",
  "module-created": "Módulo criado com sucesso.",
  "module-published": "Módulo publicado.",
  "module-reordered": "Ordem dos módulos atualizada.",
  "module-unpublished": "Módulo movido para rascunho.",
  "module-updated": "Módulo atualizado com sucesso.",
  "order-unchanged": "O item já está no limite da lista.",
  "subject-archived": "Disciplina arquivada.",
  "subject-created": "Disciplina criada com sucesso.",
  "subject-published": "Disciplina publicada.",
  "subject-reordered": "Ordem das disciplinas atualizada.",
  "subject-unpublished": "Disciplina movida para rascunho.",
  "subject-updated": "Disciplina atualizada com sucesso.",
};

const errorMessages: Record<string, string> = {
  "invalid-hierarchy": "A entidade não pertence à hierarquia informada.",
  "lesson-content-required": "Adicione conteúdo antes de publicar a aula.",
  "reorder-failed": "Não foi possível atualizar a ordem. Tente novamente.",
  "status-update": "Não foi possível alterar o status.",
};

export function AdminFeedback({ error, success }: { error?: string; success?: string }) {
  const successMessage = success ? successMessages[success] : null;
  const errorMessage = error ? errorMessages[error] : null;

  if (!successMessage && !errorMessage) return null;
  const isError = Boolean(errorMessage);

  return (
    <div
      className={
        isError
          ? "flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          : "flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      }
      role={isError ? "alert" : "status"}
    >
      {isError ? (
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      )}
      <p>{errorMessage ?? successMessage}</p>
    </div>
  );
}

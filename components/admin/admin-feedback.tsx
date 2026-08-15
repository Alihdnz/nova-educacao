import { CircleAlert, CircleCheck } from "lucide-react";

const successMessages: Record<string, string> = {
  "assessment-archived": "Avaliação arquivada.",
  "assessment-created": "Avaliação criada como rascunho.",
  "assessment-published": "Avaliação publicada.",
  "assessment-question-removed": "Questão removida; a avaliação publicada voltou para rascunho para nova validação.",
  "assessment-question-reordered": "Ordem das questões da avaliação atualizada.",
  "assessment-questions-added": "Questões adicionadas; a avaliação publicada voltou para rascunho para nova validação.",
  "assessment-unpublished": "Avaliação movida para rascunho.",
  "assessment-updated": "Avaliação atualizada com sucesso.",
  "assessment-updated-draft": "Avaliação atualizada e movida para rascunho para nova validação.",
  "assessment-weight-updated": "Peso atualizado; a avaliação publicada voltou para rascunho para nova validação.",
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
  "question-archived": "Questão arquivada; avaliações publicadas relacionadas voltaram para rascunho.",
  "question-created": "Questão criada como rascunho.",
  "question-published": "Questão publicada.",
  "question-reordered": "Ordem das questões atualizada.",
  "question-unpublished": "Questão e avaliações publicadas relacionadas movidas para rascunho.",
  "question-updated": "Questão atualizada com sucesso.",
  "question-updated-draft": "Questão atualizada e movida para rascunho; avaliações publicadas relacionadas também foram revisadas.",
  "subject-archived": "Disciplina arquivada.",
  "subject-created": "Disciplina criada com sucesso.",
  "subject-published": "Disciplina publicada.",
  "subject-reordered": "Ordem das disciplinas atualizada.",
  "subject-unpublished": "Disciplina movida para rascunho.",
  "subject-updated": "Disciplina atualizada com sucesso.",
};

const errorMessages: Record<string, string> = {
  "assessment-invalid-questions": "Publique e valide todas as questões selecionadas antes de publicar a avaliação.",
  "assessment-no-questions": "Selecione pelo menos uma questão antes de publicar a avaliação.",
  "assessment-score-mismatch": "A soma dos pesos deve ser igual à nota máxima para publicar.",
  "invalid-hierarchy": "A entidade não pertence à hierarquia informada.",
  "invalid-weight": "Informe um peso válido e maior que zero.",
  "lesson-content-required": "Adicione conteúdo antes de publicar a aula.",
  "reorder-failed": "Não foi possível atualizar a ordem. Tente novamente.",
  "question-add-failed": "Não foi possível adicionar as questões. Tente novamente.",
  "question-invalid": "A questão precisa de alternativas válidas, uma resposta correta e explicação para ser publicada.",
  "question-remove-failed": "Não foi possível remover a questão da avaliação.",
  "question-selection-required": "Selecione pelo menos uma questão disponível.",
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

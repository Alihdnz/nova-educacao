import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="space-y-6" aria-label="Carregando estrutura de cursos" role="status">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-12" />
      <div className="space-y-px overflow-hidden rounded-lg border">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-24 rounded-none" key={index} />
        ))}
      </div>
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

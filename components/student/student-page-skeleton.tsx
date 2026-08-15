import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentPageSkeleton() {
  return (
    <Container
      aria-label="Carregando área do estudante"
      className="space-y-8 py-8 sm:py-10"
      role="status"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="h-8 w-96 max-w-full" />
        <Skeleton className="h-5 w-[32rem] max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
      <span className="sr-only">Carregando...</span>
    </Container>
  );
}

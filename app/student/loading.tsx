import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <Container className="space-y-8 py-10 sm:py-14" aria-label="Carregando área do estudante" role="status">
      <div className="space-y-3 border-b pb-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64" />
      <span className="sr-only">Carregando...</span>
    </Container>
  );
}

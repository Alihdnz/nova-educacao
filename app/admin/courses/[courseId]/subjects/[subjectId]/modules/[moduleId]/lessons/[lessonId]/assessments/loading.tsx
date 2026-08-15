import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentsLoading() {
  return (
    <div aria-label="Carregando avaliações" className="space-y-6">
      <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-full max-w-xl" /></div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

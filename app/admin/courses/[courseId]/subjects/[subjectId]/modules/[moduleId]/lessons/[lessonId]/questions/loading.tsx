import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionsLoading() {
  return (
    <div aria-label="Carregando questões" className="space-y-6">
      <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-full max-w-xl" /></div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

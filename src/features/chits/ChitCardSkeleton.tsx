import { Skeleton } from '@/components/ui/Skeleton';

export function ChitCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
    </div>
  );
}

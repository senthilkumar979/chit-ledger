import { Skeleton } from '@/components/ui/Skeleton';

export function PersonCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2.5 pt-0.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}

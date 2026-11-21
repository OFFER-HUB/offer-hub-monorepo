import { Skeleton } from "@/components/ui/Skeleton";

function DocHeaderSkeleton() {
  return (
    <div className="mb-8 pb-6 border-b border-theme-border/40">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="flex-1">
          {/* h1 */}
          <Skeleton className="h-9 w-3/4 rounded-xl mb-3" />
          {/* description */}
          <Skeleton className="h-5 w-full rounded mb-1.5" />
          <Skeleton className="h-5 w-4/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function DocContentSkeleton() {
  return (
    <div className="space-y-5">
      {/* Opening paragraph */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>

      {/* Section heading + paragraph */}
      <div className="pt-3 space-y-3">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
      </div>

      {/* Code block */}
      <div className="rounded-2xl bg-bg-sunken dark:bg-bg-elevated shadow-neu-raised p-5 my-2">
        <div className="space-y-2">
          {[90, 70, 55, 80, 65, 75].map((pct, i) => (
            <Skeleton key={i} className="h-4 rounded" style={{ width: `${pct}%` }} />
          ))}
        </div>
      </div>

      {/* Second section heading + paragraph */}
      <div className="pt-3 space-y-3">
        <Skeleton className="h-7 w-44 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>

      {/* Unordered list */}
      <div className="space-y-2.5 pl-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>
        ))}
      </div>

      {/* Closing paragraph */}
      <div className="pt-2 space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-3/5 rounded" />
      </div>
    </div>
  );
}

function DocFooterSkeleton() {
  return (
    <div className="mt-8 pt-6 border-t border-theme-border">
      <Skeleton className="h-4 w-44 rounded" />
    </div>
  );
}

export default function DocSlugLoading() {
  return (
    <article className="min-w-0">
      <DocHeaderSkeleton />
      <DocContentSkeleton />
      <DocFooterSkeleton />
    </article>
  );
}

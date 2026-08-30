function DocHeaderSkeleton() {
  return (
    <div className="mb-8 pb-6 border-b border-theme-border/40">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="flex-1 animate-pulse">
          {/* h1 */}
          <div className="h-9 w-3/4 bg-bg-sunken dark:bg-bg-elevated rounded-xl shadow-neu-raised mb-3" />
          {/* description */}
          <div className="h-5 w-full bg-bg-sunken dark:bg-bg-elevated rounded mb-1.5" />
          <div className="h-5 w-4/5 bg-bg-sunken dark:bg-bg-elevated rounded" />
        </div>
      </div>
    </div>
  );
}

function DocContentSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Opening paragraph */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-bg-sunken dark:bg-bg-elevated rounded" />
        <div className="h-4 w-5/6 bg-bg-sunken dark:bg-bg-elevated rounded" />
        <div className="h-4 w-full bg-bg-sunken dark:bg-bg-elevated rounded" />
        <div className="h-4 w-3/4 bg-bg-sunken dark:bg-bg-elevated rounded" />
      </div>

      {/* Section heading + paragraph */}
      <div className="pt-3 space-y-3">
        <div className="h-7 w-56 bg-bg-sunken dark:bg-bg-elevated rounded-lg shadow-neu-raised" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-bg-sunken dark:bg-bg-elevated rounded" />
          <div className="h-4 w-5/6 bg-bg-sunken dark:bg-bg-elevated rounded" />
          <div className="h-4 w-full bg-bg-sunken dark:bg-bg-elevated rounded" />
        </div>
      </div>

      {/* Code block */}
      <div className="rounded-2xl bg-bg-sunken dark:bg-bg-elevated shadow-neu-raised p-5 my-2">
        <div className="space-y-2">
          {[90, 70, 55, 80, 65, 75].map((pct, i) => (
            <div key={i} className="h-4 bg-bg-elevated dark:bg-bg-base rounded" style={{ width: `${pct}%` }} />
          ))}
        </div>
      </div>

      {/* Second section heading + paragraph */}
      <div className="pt-3 space-y-3">
        <div className="h-7 w-44 bg-bg-sunken dark:bg-bg-elevated rounded-lg shadow-neu-raised" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-bg-sunken dark:bg-bg-elevated rounded" />
          <div className="h-4 w-3/4 bg-bg-sunken dark:bg-bg-elevated rounded" />
          <div className="h-4 w-5/6 bg-bg-sunken dark:bg-bg-elevated rounded" />
          <div className="h-4 w-2/3 bg-bg-sunken dark:bg-bg-elevated rounded" />
        </div>
      </div>

      {/* Unordered list */}
      <div className="space-y-2.5 pl-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-bg-elevated dark:bg-bg-base shrink-0" />
            <div className="h-4 w-4/5 bg-bg-sunken dark:bg-bg-elevated rounded" />
          </div>
        ))}
      </div>

      {/* Closing paragraph */}
      <div className="pt-2 space-y-2">
        <div className="h-4 w-full bg-bg-sunken dark:bg-bg-elevated rounded" />
        <div className="h-4 w-5/6 bg-bg-sunken dark:bg-bg-elevated rounded" />
        <div className="h-4 w-3/5 bg-bg-sunken dark:bg-bg-elevated rounded" />
      </div>
    </div>
  );
}

function DocFooterSkeleton() {
  return (
    <div className="mt-8 pt-6 border-t border-theme-border">
      <div className="h-4 w-44 bg-bg-sunken dark:bg-bg-elevated rounded animate-pulse" />
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

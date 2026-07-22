export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-ink-200/60 dark:bg-ink-800/60 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
    </div>
  )
}

export function SkeletonGrid({ count = 4, columns = 'sm:grid-cols-2 lg:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

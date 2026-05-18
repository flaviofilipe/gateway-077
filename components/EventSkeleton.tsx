export default function EventSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 animate-pulse">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--bg)]" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex gap-1.5">
          <div className="h-4 w-8 rounded bg-[var(--bg)]" />
          <div className="h-4 w-14 rounded bg-[var(--bg)]" />
        </div>
        <div className="h-4 w-3/4 rounded bg-[var(--bg)]" />
        <div className="h-3 w-20 rounded bg-[var(--bg)]" />
        <div className="h-3 w-full rounded bg-[var(--bg)]" />
      </div>
    </div>
  );
}

export function EventSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventSkeleton key={i} />
      ))}
    </div>
  );
}

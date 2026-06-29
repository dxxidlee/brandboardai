import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <div className="bg-aurora flex h-[calc(100vh-4rem)]">
      <aside className="hidden w-[330px] shrink-0 flex-col gap-4 border-r border-border/50 p-4 lg:flex">
        <Skeleton className="h-10 w-2/3 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="mt-auto space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-6">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
            <Skeleton className="h-56 w-full rounded-3xl" />
          </div>
        </div>
      </div>

      <aside className="hidden w-[300px] shrink-0 flex-col gap-4 border-l border-border/50 p-4 2xl:flex">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </aside>
    </div>
  );
}

import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function BoardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 sm:px-4">
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-64 shrink-0 border-r border-border p-3 md:block">
          <Skeleton className="mb-3 h-10 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-dots text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Loading canvas…</p>
        </div>
        <div className="hidden w-72 shrink-0 border-l border-border p-5 lg:block">
          <Skeleton className="mb-4 h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

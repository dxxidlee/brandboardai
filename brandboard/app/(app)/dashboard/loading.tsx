import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCardSkeleton } from "@/components/dashboard/project-card-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="mt-4 h-[88px] w-full rounded-2xl" />
      </div>

      <Skeleton className="mb-4 h-4 w-40" />
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
      </div>

      <Skeleton className="mb-4 h-4 w-36" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

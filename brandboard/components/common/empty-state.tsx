import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center",
        className
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 blur-xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-balance text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

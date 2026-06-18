import Link from "next/link";
import { MoreHorizontal, Layers, Search, Wand2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";

const STATUS_META: Record<
  Project["status"],
  { dot: string; label: string; labelClass: string }
> = {
  Ready: {
    dot: "bg-[hsl(140_55%_45%)]",
    label: "Ready",
    labelClass: "text-foreground",
  },
  Generating: {
    dot: "bg-primary animate-pulse",
    label: "Generating",
    labelClass: "text-primary",
  },
  Draft: {
    dot: "bg-muted-foreground/50",
    label: "Draft",
    labelClass: "text-muted-foreground",
  },
};

export function ProjectCard({ project }: { project: Project }) {
  const generating = project.status === "Generating";
  const status = STATUS_META[project.status];
  const TypeIcon = project.type === "Audit" ? Search : Wand2;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumb}
          alt={project.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]",
            generating && "opacity-80"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        {generating && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
            <TypeIcon className="h-3 w-3" />
            {project.type}
          </span>
        </div>

        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-background/85 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
          aria-label="Project options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* Monogram */}
        <span
          className="absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg ring-4 ring-card"
          style={{ backgroundColor: project.coverColor }}
        >
          {project.title.charAt(0)}
        </span>
      </div>

      <div className="px-4 pb-3 pt-7">
        <p className="truncate font-semibold leading-tight">{project.title}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {project.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1.5", status.labelClass)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {project.boards}
          </span>
        </span>
        <span>{project.updatedAt}</span>
      </div>
    </Link>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { Search, FolderOpen, X, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/common/empty-state";
import { PROJECTS } from "@/lib/mock-data";

const FILTERS = ["All", "Audit", "Moodboard"] as const;
type Filter = (typeof FILTERS)[number];

export function ProjectsExplorer({
  initialFilter = "All",
}: {
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = React.useState<Filter>(initialFilter);
  const [query, setQuery] = React.useState("");

  const filtered = PROJECTS.filter((p) => {
    const matchesFilter = filter === "All" || p.type === filter;
    const matchesQuery =
      query.trim() === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "All" ? "All" : `${f}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="h-9 bg-card pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description={
            query
              ? `No projects match “${query}”. Try a different search or clear your filters.`
              : "There are no projects in this category yet. Start a new one to get going."
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : (
              <Button asChild className="gap-1.5">
                <Link href="/new">
                  <Plus className="h-4 w-4" />
                  New project
                </Link>
              </Button>
            )
          }
          className="mt-2"
        />
      )}
    </div>
  );
}

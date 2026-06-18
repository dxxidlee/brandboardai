import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectsExplorer } from "@/components/dashboard/projects-explorer";
import { PROJECTS } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            {PROJECTS.length} brand boards in your workspace.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-1.5">
          <Link href="/new">
            <Plus className="h-4 w-4" />
            New
          </Link>
        </Button>
      </div>

      <ProjectsExplorer />
    </div>
  );
}

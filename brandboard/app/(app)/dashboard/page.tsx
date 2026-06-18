import Link from "next/link";
import {
  ArrowRight,
  Search,
  Sparkles,
  LayoutGrid,
  Palette,
  Target,
  FolderOpen,
  Layers,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/project-card";
import {
  PROJECTS,
  TEMPLATES,
  EXAMPLE_PROMPTS,
} from "@/lib/mock-data";

const TEMPLATE_ICONS: Record<string, typeof Search> = {
  search: Search,
  layout: LayoutGrid,
  palette: Palette,
  target: Target,
};

const STATS = [
  { label: "Projects", value: PROJECTS.length, icon: FolderOpen },
  {
    label: "Boards",
    value: PROJECTS.reduce((sum, p) => sum + p.boards, 0),
    icon: Layers,
  },
  { label: "Audits left", value: 3, icon: Sparkles },
  { label: "Last active", value: "2h", icon: Clock },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      {/* Greeting + prompt */}
      <section className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Good afternoon, David
        </h1>
        <p className="mt-1 text-muted-foreground">
          Start a new brand audit or moodboard from a single prompt.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-accent/60 to-card p-1.5">
          <div className="flex items-center gap-2 rounded-xl bg-card p-2 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <input
              disabled
              placeholder="Audit a company, paste a URL, or describe a concept…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button asChild className="gap-1.5">
              <Link href="/new">
                Generate
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 px-2 py-2.5">
            {EXAMPLE_PROMPTS.slice(0, 5).map((p) => (
              <Link
                key={p}
                href="/new"
                className="rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-semibold leading-none tracking-tight">
                {s.value}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Templates */}
      <section id="templates" className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Start from a template
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => {
            const Icon = TEMPLATE_ICONS[t.icon] ?? Search;
            return (
              <Link
                key={t.id}
                href="/new"
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: t.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent projects
          </h2>
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/projects">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

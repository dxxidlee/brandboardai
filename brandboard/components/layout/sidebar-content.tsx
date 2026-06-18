"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  FolderOpen,
  Palette,
  Settings,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/mock-data";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Templates", href: "/dashboard#templates", icon: Palette },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && href.startsWith("/") && pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-2">
        <Button asChild className="w-full justify-start gap-2 shadow-sm">
          <Link href="/new" onClick={onNavigate}>
            <Plus className="h-4 w-4" />
            New audit
          </Link>
        </Button>
      </div>

      <nav className="mt-5 flex flex-col gap-0.5 px-3">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </p>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-primary" : "group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3 scrollbar-thin">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Recent
        </p>
        <div className="flex flex-col gap-0.5">
          {PROJECTS.slice(0, 5).map((p) => {
            const active = pathname === `/projects/${p.id}`;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary/70 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[4px] ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: p.coverColor }}
                />
                <span className="truncate">{p.title}</span>
                {p.status === "Generating" && (
                  <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-border p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <div className="mt-2 overflow-hidden rounded-xl bg-gradient-to-br from-accent to-secondary p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="text-xs">
              <p className="font-medium text-foreground">Free plan</p>
              <p className="text-muted-foreground">3 of 5 audits used</p>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

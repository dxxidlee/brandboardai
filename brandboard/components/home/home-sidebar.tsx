"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  LayoutGrid,
  LayoutTemplate,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PROJECTS } from "@/lib/mock-data";

const NAV = [
  { label: "Chats", href: "/new", icon: MessageSquare },
  { label: "Boards", href: "/projects", icon: LayoutGrid },
  { label: "Templates", href: "/dashboard#templates", icon: LayoutTemplate },
] as const;

const COLLAPSED_W = 76;
const EXPANDED_W = 264;

/**
 * Narrow, elegant AI workspace sidebar. Collapsed to an icon rail by default;
 * expands on toggle. Holds the logo, primary nav, recent conversations, and
 * settings.
 */
export function HomeSidebar() {
  const [expanded, setExpanded] = React.useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/new") return pathname === "/new";
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-card/30 backdrop-blur-xl lg:flex"
    >
      {/* Brand + collapse toggle */}
      <div className="flex h-16 items-center gap-2 px-4">
        <Link href="/new" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[hsl(280_70%_60%)] text-primary-foreground shadow-sm">
            <span className="text-[15px] font-bold leading-none">B</span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[hsl(40_95%_60%)] ring-2 ring-background" />
          </span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-[15px] font-semibold tracking-tight"
              >
                Brandboard
                <span className="text-muted-foreground"> AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* New chat */}
      <div className="px-3.5">
        <Link
          href="/new"
          className={cn(
            "flex h-10 items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 px-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card",
            !expanded && "justify-center px-0"
          )}
        >
          <Plus className="h-[18px] w-[18px] shrink-0 text-primary" />
          {expanded && <span className="whitespace-nowrap">New chat</span>}
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="mt-4 flex flex-col gap-1 px-3.5">
        {NAV.map((item) => (
          <NavRow
            key={item.label}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
            expanded={expanded}
          />
        ))}
      </nav>

      {/* Recent conversations */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3.5 scrollbar-thin">
        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
            >
              Recent
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex flex-col gap-0.5">
          {PROJECTS.slice(0, 6).map((p) => {
            const active = pathname === `/projects/${p.id}`;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                title={p.title}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                  active
                    ? "bg-secondary/70 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  !expanded && "justify-center px-0"
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[4px] ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: p.coverColor }}
                />
                {expanded && (
                  <span className="truncate whitespace-nowrap">{p.title}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer: settings + collapse toggle */}
      <div className="mt-auto flex flex-col gap-1 border-t border-border/50 px-3.5 py-3">
        <NavRow
          href="/settings"
          label="Settings"
          icon={Settings}
          active={isActive("/settings")}
          expanded={expanded}
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "flex h-10 items-center gap-3 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
            !expanded && "justify-center px-0"
          )}
        >
          {expanded ? (
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" />
          )}
          {expanded && <span className="whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function NavRow({
  href,
  label,
  icon: Icon,
  active,
  expanded,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  expanded: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-secondary/80 text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        !expanded && "justify-center px-0"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "group-hover:text-foreground"
        )}
      />
      {expanded && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
}

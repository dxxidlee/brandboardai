"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Tighter padding for sidebar-style blocks. */
  compact?: boolean;
};

/**
 * A frosted-glass workspace block that reveals on scroll. Used for every
 * modular section of the audit (Brand Snapshot, Positioning, etc.).
 */
export function Section({
  id,
  eyebrow,
  title,
  icon: Icon,
  action,
  children,
  className,
  compact,
}: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-panel scroll-mt-24 rounded-3xl border border-border/60 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.45)]",
        compact ? "p-5" : "p-6 sm:p-7",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {eyebrow}
            </p>
          )}
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </motion.section>
  );
}

/**
 * Elegant empty / not-connected state — never an ugly grey placeholder.
 */
export function FallbackState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-10 text-center",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

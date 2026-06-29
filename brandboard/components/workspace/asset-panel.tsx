"use client";

import { motion } from "framer-motion";
import { Palette, Type, Users, Layers } from "lucide-react";

import type { ProjectBrandAssets } from "@/types/brand-assets";

type AssetPanelProps = {
  brandAssets: ProjectBrandAssets;
  confidenceLabel?: string | null;
  stats: { competitors: number; insights: number; references: number };
};

/**
 * Optional right-hand glance panel: brand assets at a glance + quick stats.
 */
export function WorkspaceAssetPanel({
  brandAssets,
  confidenceLabel,
  stats,
}: AssetPanelProps) {
  const { colors, fonts, connected } = brandAssets;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="flex h-full flex-col gap-4 overflow-y-auto px-0.5 pb-6 scrollbar-thin"
    >
      <div className="glass-panel rounded-2xl border border-border/60 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          At a glance
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat icon={Users} value={stats.competitors} label="Rivals" />
          <Stat icon={Layers} value={stats.insights} label="Insights" />
          <Stat icon={Palette} value={stats.references} label="Images" />
        </div>
        {confidenceLabel && (
          <p className="mt-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            {confidenceLabel}
          </p>
        )}
      </div>

      <div className="glass-panel rounded-2xl border border-border/60 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          <Palette className="h-3.5 w-3.5" /> Palette
        </p>
        {connected && colors.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {colors.slice(0, 8).map((c) => (
              <span
                key={`${c.hex}-${c.name}`}
                title={`${c.name} · ${c.hex}`}
                className="h-7 w-7 rounded-lg ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Brand assets not connected yet.
          </p>
        )}
      </div>

      <div className="glass-panel rounded-2xl border border-border/60 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          <Type className="h-3.5 w-3.5" /> Typefaces
        </p>
        {connected && fonts.length > 0 ? (
          <ul className="mt-2.5 space-y-1.5">
            {fonts.slice(0, 4).map((f) => (
              <li
                key={`${f.family}-${f.role}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate" style={{ fontFamily: f.family }}>
                  {f.family}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {f.role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Brand assets not connected yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/40 py-2.5">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-base font-semibold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

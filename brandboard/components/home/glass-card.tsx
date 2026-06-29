"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type GlassCardProps = HTMLMotionProps<"div"> & {
  /** Stronger blur + opacity for foreground surfaces like the prompt box. */
  variant?: "panel" | "strong";
  /** Subtle interactive lift on hover. */
  interactive?: boolean;
};

/**
 * Frosted-glass surface used across the AI workspace. Soft shadow, 1px border,
 * large radius. Wraps a motion.div so callers can animate it directly.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "panel", interactive = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl border border-border/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)]",
          variant === "strong" ? "glass-strong" : "glass-panel",
          interactive &&
            "transition-shadow duration-300 hover:shadow-[0_16px_60px_-12px_rgba(0,0,0,0.55)]",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

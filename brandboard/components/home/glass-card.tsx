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
          "shadow-soft rounded-3xl border border-border/70",
          variant === "strong" ? "glass-strong" : "glass-panel",
          interactive &&
            "transition-shadow duration-300 hover:shadow-soft-lg",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Animated checklist the assistant reveals while initializing an audit. Items
 * up to `activeIndex` render as completed; the active one shows a spinner.
 */
export function ProgressTimeline({
  steps,
  activeIndex,
  className,
}: {
  steps: string[];
  activeIndex: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                done
                  ? "border-primary/30 bg-primary/15 text-primary"
                  : active
                    ? "border-primary/40 text-primary"
                    : "border-border/70 text-muted-foreground/50"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                ) : active ? (
                  <motion.span key="spin">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="dot"
                    className="h-1.5 w-1.5 rounded-full bg-current"
                  />
                )}
              </AnimatePresence>
            </span>
            <span
              className={cn(
                "text-[15px] transition-colors duration-300",
                done || active
                  ? "text-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              {step}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

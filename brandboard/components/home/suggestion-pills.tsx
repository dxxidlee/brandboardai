"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};

const pill = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * Quick-start pills under the prompt. Clicking a pill fills the composer.
 */
export function SuggestionPills({
  prompts,
  onSelect,
  disabled,
  className,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    >
      {prompts.map((prompt) => (
        <motion.button
          key={prompt}
          type="button"
          variants={pill}
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {prompt}
        </motion.button>
      ))}
    </motion.div>
  );
}

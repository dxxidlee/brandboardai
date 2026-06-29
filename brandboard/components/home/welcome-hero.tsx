"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * The centered welcome above the prompt: product name + one-line value prop.
 */
export function WelcomeHero() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center text-center"
    >
      <motion.div
        variants={item}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Brandboard AI
      </motion.div>

      <motion.h1
        variants={item}
        className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-[3.25rem] sm:leading-[1.05]"
      >
        Describe the brand you{" "}
        <span className="bg-gradient-to-r from-primary to-[hsl(280_80%_64%)] bg-clip-text text-transparent">
          want to build.
        </span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        Your AI creative strategist for branding, positioning, competitors,
        visual identity, and inspiration.
      </motion.p>
    </motion.div>
  );
}

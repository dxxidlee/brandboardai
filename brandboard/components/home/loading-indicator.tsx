"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Three-dot "thinking" indicator used while the assistant prepares a response.
 */
export function LoadingIndicator({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

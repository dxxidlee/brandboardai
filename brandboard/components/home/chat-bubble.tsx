"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type ChatBubbleProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
};

/**
 * A single conversation turn. The user message is right-aligned in a soft
 * accent bubble; the assistant message is left-aligned with an AI avatar.
 */
export function ChatBubble({ role, children, className }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(280_70%_60%)] text-primary-foreground shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isUser
            ? "rounded-br-md bg-primary/12 text-foreground ring-1 ring-inset ring-primary/20"
            : "rounded-bl-md bg-card/60 text-foreground ring-1 ring-inset ring-border/60"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

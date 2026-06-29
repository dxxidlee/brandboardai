"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

type PromptComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  /** Examples cycled through the placeholder when the field is empty. */
  examples?: string[];
  className?: string;
  autoFocus?: boolean;
};

/**
 * The hero input: a large, rounded, Apple-style glass composer with attachment
 * and voice affordances (UI only for now) plus a send button. Pressing Enter
 * submits; Shift+Enter inserts a newline.
 */
export function PromptComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  examples = [],
  className,
  autoFocus = false,
}: PromptComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);

  // Auto-grow the textarea to fit its content.
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  // Rotate the example placeholder while empty and unfocused.
  React.useEffect(() => {
    if (examples.length === 0 || value || focused) return;
    const id = setInterval(
      () => setPlaceholderIndex((i) => (i + 1) % examples.length),
      2800
    );
    return () => clearInterval(id);
  }, [examples, value, focused]);

  const placeholder =
    examples.length > 0 && !value
      ? `Ask anything…  e.g. ${examples[placeholderIndex]}`
      : "Ask anything…";

  const canSubmit = value.trim().length > 0 && !disabled;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "glass-strong relative rounded-[28px] border p-2.5 shadow-[0_12px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300",
          focused
            ? "border-primary/40 ring-4 ring-primary/10"
            : "border-border/70"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          placeholder={placeholder}
          className="block max-h-[220px] min-h-[28px] w-full resize-none bg-transparent px-3.5 pb-2 pt-2.5 text-[17px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-2 px-1.5 pb-0.5">
          <div className="flex items-center gap-1">
            <ComposerIconButton label="Attach a file" disabled={disabled}>
              <Paperclip className="h-[18px] w-[18px]" />
            </ComposerIconButton>
            <ComposerIconButton label="Voice input" disabled={disabled}>
              <Mic className="h-[18px] w-[18px]" />
            </ComposerIconButton>
          </div>

          <motion.button
            type="button"
            aria-label="Send"
            disabled={!canSubmit}
            onClick={() => canSubmit && onSubmit()}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
              canSubmit
                ? "bg-primary text-primary-foreground shadow-md hover:opacity-90"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ComposerIconButton({
  children,
  label,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground disabled:opacity-50"
    >
      {children}
    </button>
  );
}

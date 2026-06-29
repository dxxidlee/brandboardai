"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";

import type { ColorSwatch } from "@/lib/mock-data";
import type { VisualReferenceImage } from "@/types/brand-assets";

type MoodboardPreviewProps = {
  boardHref: string;
  colors: ColorSwatch[];
  images: VisualReferenceImage[];
  fontFamily?: string | null;
};

/**
 * A tactile preview of the creative board plus the primary "Open Canvas" CTA —
 * designed to feel like stepping into a creative workspace.
 */
export function MoodboardPreview({
  boardHref,
  colors,
  images,
  fontFamily,
}: MoodboardPreviewProps) {
  const previewColors = (colors.length > 0
    ? colors
    : [
        { hex: "#6D5BD0", name: "Primary", role: "Primary" },
        { hex: "#E8E2D5", name: "Sand", role: "Surface" },
        { hex: "#2B2B26", name: "Ink", role: "Text" },
      ]
  ).slice(0, 5);
  const previewImages = images.slice(0, 2);

  return (
    <Link href={boardHref} className="block">
      <motion.div
        whileHover="hover"
        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/60 to-secondary/20 p-5"
      >
        {/* Floating collage */}
        <div className="pointer-events-none relative mb-5 h-36">
          <motion.div
            variants={{ hover: { y: -4, rotate: -3 } }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="absolute left-2 top-2 flex gap-1.5 rounded-xl border border-border/60 bg-card/70 p-2 shadow-lg backdrop-blur-sm"
          >
            {previewColors.map((c) => (
              <span
                key={`${c.hex}-${c.name}`}
                className="h-10 w-7 rounded-md ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </motion.div>

          {previewImages[0] && (
            <motion.div
              variants={{ hover: { y: -6, rotate: 4 } }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="absolute right-3 top-0 h-28 w-36 overflow-hidden rounded-xl border border-border/60 shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImages[0].url}
                alt={previewImages[0].label}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          <motion.div
            variants={{ hover: { y: -3, rotate: 2 } }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="absolute bottom-0 left-8 rounded-xl border border-border/60 bg-card/70 px-3.5 py-2 shadow-lg backdrop-blur-sm"
          >
            <span
              className="text-xl tracking-tight"
              style={fontFamily ? { fontFamily } : undefined}
            >
              {fontFamily ?? "Aa"} —{" "}
              <span className="text-muted-foreground">quiet luxury</span>
            </span>
          </motion.div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Open Canvas
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Arrange references, colors & type on an infinite board.
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/** Compact "Open canvas" button for the workspace header. */
export function OpenCanvasButton({ boardHref }: { boardHref: string }) {
  return (
    <Link
      href={boardHref}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
    >
      <LayoutGrid className="h-4 w-4" />
      Open canvas
    </Link>
  );
}

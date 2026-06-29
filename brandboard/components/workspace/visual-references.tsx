"use client";

import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FallbackState } from "@/components/workspace/section";
import type { VisualReferenceImage } from "@/types/brand-assets";

/**
 * Brandfetch-pulled imagery as a motion card grid, with an elegant fallback
 * when no images were returned.
 */
export function VisualReferences({ images }: { images: VisualReferenceImage[] }) {
  if (images.length === 0) {
    return (
      <FallbackState
        icon={ImageOff}
        title="No reference images yet"
        description="Brandfetch didn't return imagery for this brand. Colors, fonts, and the strategic audit are still available."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image, i) => (
        <motion.figure
          key={image.url}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="group overflow-hidden rounded-2xl border border-border/60 bg-card/40"
        >
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.label}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="truncate text-sm font-medium">{image.label}</span>
            <Badge variant="secondary" className="shrink-0 capitalize">
              {image.source}
            </Badge>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

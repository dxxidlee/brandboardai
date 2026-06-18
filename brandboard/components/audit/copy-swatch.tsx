"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import type { ColorSwatch } from "@/lib/mock-data";

export function CopySwatch({ color }: { color: ColorSwatch }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
    } catch {
      /* ignore in mock */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={copy}
      className="group flex flex-col overflow-hidden rounded-xl border border-border text-left transition-shadow hover:shadow-md"
    >
      <span
        className="relative flex h-20 items-end justify-end p-2"
        style={{ backgroundColor: color.hex }}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/20 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </span>
      </span>
      <span className="px-2.5 py-2">
        <span className="block text-sm font-medium leading-tight">
          {color.name}
        </span>
        <span className="block text-xs uppercase text-muted-foreground">
          {color.hex}
        </span>
        <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-muted-foreground">
          {color.role}
        </span>
      </span>
    </button>
  );
}

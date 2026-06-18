"use client";

import * as React from "react";
import {
  Plus,
  Minus,
  Maximize,
  Copy,
  Trash2,
  RotateCcw,
  MousePointer2,
} from "lucide-react";

import { CanvasCardView } from "@/components/canvas/canvas-card";
import type { CanvasCard } from "@/lib/mock-data";

type MoodboardCanvasProps = {
  initialCards: CanvasCard[];
};

export function MoodboardCanvas({ initialCards }: MoodboardCanvasProps) {
  const [cards, setCards] = React.useState<CanvasCard[]>(initialCards);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState(1);
  const [moved, setMoved] = React.useState(false);

  React.useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const drag = React.useRef<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const bringToFront = React.useCallback((id: string) => {
    setCards((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      return [...prev.filter((c) => c.id !== id), target];
    });
  }, []);

  const onCardPointerDown = (card: CanvasCard) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelected(card.id);
    if (card.kind !== "section") bringToFront(card.id);
    drag.current = {
      id: card.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: card.x,
      originY: card.y,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.startX) / scale;
    const dy = (e.clientY - drag.current.startY) / scale;
    if (!drag.current.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      drag.current.moved = true;
      setMoved(true);
    }
    const { id, originX, originY } = drag.current;
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, x: originX + dx, y: originY + dy } : c
      )
    );
  };

  const endDrag = () => {
    drag.current = null;
  };

  const zoom = (dir: 1 | -1) =>
    setScale((s) => Math.min(1.6, Math.max(0.4, +(s + dir * 0.1).toFixed(2))));

  const deleteSelected = React.useCallback(() => {
    if (!selected) return;
    setCards((prev) => prev.filter((c) => c.id !== selected));
    setSelected(null);
  }, [selected]);

  const duplicateSelected = React.useCallback(() => {
    if (!selected) return;
    setCards((prev) => {
      const target = prev.find((c) => c.id === selected);
      if (!target) return prev;
      const copy = {
        ...target,
        id: `${target.id}-copy-${Date.now()}`,
        x: target.x + 24,
        y: target.y + 24,
      } as CanvasCard;
      setSelected(copy.id);
      return [...prev, copy];
    });
  }, [selected]);

  const resetLayout = () => {
    setCards(initialCards);
    setSelected(null);
    setScale(1);
    setMoved(false);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea")) return;
      if (e.key === "Escape") setSelected(null);
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, deleteSelected]);

  const selectedCard = cards.find((c) => c.id === selected);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Scrollable canvas viewport */}
      <div
        className="scrollbar-thin h-full w-full overflow-auto bg-dots"
        onPointerDown={() => setSelected(null)}
      >
        <div
          className="relative"
          style={{
            width: 1400,
            height: 900,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {cards.length === 0 ? (
            <div className="flex h-[900px] w-[1400px] items-center justify-center p-8 text-center">
              <div className="max-w-md rounded-2xl border border-dashed border-border bg-card/60 px-6 py-8">
                <p className="text-sm font-medium">No canvas items yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Run a brand audit with Brandfetch connected assets to populate this
                  board with logos, colors, fonts, and visual references.
                </p>
              </div>
            </div>
          ) : (
            cards.map((card) => (
              <CanvasCardView
                key={card.id}
                card={card}
                selected={selected === card.id}
                onPointerDown={onCardPointerDown(card)}
              />
            ))
          )}
        </div>
      </div>

      {/* Selection toolbar */}
      {selectedCard && (
        <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur animate-in fade-in-0 slide-in-from-top-2">
          <span className="px-2 text-xs font-medium capitalize text-muted-foreground">
            {selectedCard.kind}
          </span>
          <span className="h-5 w-px bg-border" />
          <ToolbarButton onClick={duplicateSelected} label="Duplicate">
            <Copy className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={deleteSelected} label="Delete" danger>
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Bottom controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-lg backdrop-blur">
          <ToolbarButton onClick={() => zoom(-1)} label="Zoom out" round>
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <button
            onClick={() => setScale(1)}
            className="w-12 text-center text-xs font-medium tabular-nums text-foreground transition-colors hover:text-primary"
            aria-label="Reset zoom to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolbarButton onClick={() => zoom(1)} label="Zoom in" round>
            <Plus className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton onClick={() => setScale(1)} label="Fit to screen" round>
            <Maximize className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={resetLayout} label="Reset layout" round>
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Hint */}
      {!moved && (
        <div className="pointer-events-none absolute right-4 top-4 hidden items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur sm:flex">
          <MousePointer2 className="h-3.5 w-3.5" />
          Drag cards to rearrange · ⌫ to delete
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
  round,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  round?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors ${
        round ? "rounded-full" : "rounded-lg"
      } ${
        danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

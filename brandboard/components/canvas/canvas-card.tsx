import { cn } from "@/lib/utils";
import type { CanvasCard } from "@/lib/mock-data";

export function CanvasCardView({
  card,
  selected,
  onPointerDown,
}: {
  card: CanvasCard;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const base =
    "absolute select-none touch-none transition-shadow will-change-transform";
  const ring = selected
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
    : "";

  const style: React.CSSProperties = {
    left: card.x,
    top: card.y,
    width: card.w,
    height: card.h,
    transform: `rotate(${card.rotation}deg)`,
  };

  if (card.kind === "section") {
    return (
      <div
        style={style}
        onPointerDown={onPointerDown}
        className={cn(
          base,
          "rounded-2xl border-2 border-dashed border-border/80 bg-secondary/20",
          selected && "border-primary"
        )}
      >
        <span className="absolute -top-3 left-4 rounded-full bg-background px-2.5 py-0.5 text-xs font-semibold text-muted-foreground shadow-sm">
          {card.title}
        </span>
      </div>
    );
  }

  if (card.kind === "image") {
    return (
      <figure
        style={style}
        onPointerDown={onPointerDown}
        className={cn(base, "group cursor-grab overflow-hidden rounded-xl bg-card shadow-lg active:cursor-grabbing", ring)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.url}
          alt={card.label}
          draggable={false}
          className="h-full w-full object-cover"
        />
        <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-2 text-xs font-medium text-white transition-transform group-hover:translate-y-0">
          {card.label}
        </figcaption>
      </figure>
    );
  }

  if (card.kind === "color") {
    return (
      <div
        style={style}
        onPointerDown={onPointerDown}
        className={cn(base, "cursor-grab overflow-hidden rounded-xl shadow-lg active:cursor-grabbing", ring)}
      >
        <span className="block h-2/3 w-full" style={{ backgroundColor: card.hex }} />
        <span className="flex h-1/3 flex-col justify-center bg-card px-2.5">
          <span className="text-xs font-semibold leading-tight">{card.name}</span>
          <span className="text-[10px] uppercase text-muted-foreground">
            {card.hex}
          </span>
        </span>
      </div>
    );
  }

  if (card.kind === "type") {
    return (
      <div
        style={style}
        onPointerDown={onPointerDown}
        className={cn(base, "flex cursor-grab flex-col justify-center rounded-xl border border-border bg-card p-4 shadow-lg active:cursor-grabbing", ring)}
      >
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {card.family}
        </span>
        <span className="mt-1 font-display text-3xl italic leading-tight">
          {card.sample}
        </span>
      </div>
    );
  }

  // note
  return (
    <div
      style={style}
      onPointerDown={onPointerDown}
      className={cn(base, "cursor-grab rounded-xl bg-[hsl(45_90%_75%)] p-3.5 text-[hsl(40_50%_15%)] shadow-lg active:cursor-grabbing", ring)}
    >
      <p className="text-sm leading-snug">{card.text}</p>
    </div>
  );
}

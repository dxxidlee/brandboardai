"use client";

import {
  Image as ImageIcon,
  Palette,
  Type,
  StickyNote,
  Layers,
  Plus,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { BoardSidebarAssets } from "@/lib/canvas/board-data";
import { SIDEBAR_ASSETS } from "@/lib/mock-data";

type LeftPanelProps = {
  assets?: BoardSidebarAssets;
};

export function LeftPanel({ assets }: LeftPanelProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      <LeftPanelContent assets={assets} />
    </aside>
  );
}

export function LeftPanelContent({ assets }: LeftPanelProps) {
  const colors = assets?.colors.length
    ? assets.colors.map((color) => color.hex)
    : SIDEBAR_ASSETS.colors;
  const fonts = assets?.fonts.length
    ? assets.fonts.map((font) => font.family)
    : SIDEBAR_ASSETS.typography;
  const images = assets?.images.length
    ? assets.images
    : SIDEBAR_ASSETS.images.map((url) => ({
        url,
        label: "Reference",
        source: "mock",
      }));

  return (
    <Tabs defaultValue="images" className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <TabsList className="grid w-full grid-cols-5 bg-secondary/60">
          <TabTrigger value="assets" label="Assets" icon={<Layers className="h-4 w-4" />} />
          <TabTrigger value="colors" label="Colors" icon={<Palette className="h-4 w-4" />} />
          <TabTrigger value="type" label="Type" icon={<Type className="h-4 w-4" />} />
          <TabTrigger value="images" label="Images" icon={<ImageIcon className="h-4 w-4" />} />
          <TabTrigger value="notes" label="Notes" icon={<StickyNote className="h-4 w-4" />} />
        </TabsList>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <TabsContent value="assets" className="mt-0">
            <PanelHeading>All assets</PanelHeading>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Brand assets pulled from your audit pipeline.
            </p>
            {assets?.logoUrl && (
              <div className="mb-3 rounded-lg border border-border bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assets.logoUrl}
                  alt="Brand logo"
                  className="mx-auto h-16 w-full max-w-[140px] object-contain"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 4).map((image) => (
                <DragImage key={image.url} src={image.url} label={image.label} />
              ))}
              {colors.slice(0, 2).map((hex) => (
                <div
                  key={hex}
                  className="aspect-square rounded-lg border border-border"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="mt-0">
            <PanelHeading>Colors</PanelHeading>
            {colors.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {colors.map((hex) => (
                  <button
                    key={hex}
                    title={hex}
                    className="aspect-square rounded-lg border border-border shadow-sm transition-transform hover:scale-110 hover:shadow-md"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            ) : (
              <EmptyAssets message="No brand colors saved yet." />
            )}
          </TabsContent>

          <TabsContent value="type" className="mt-0">
            <PanelHeading>Typography</PanelHeading>
            {fonts.length > 0 ? (
              <div className="space-y-2">
                {fonts.map((family) => (
                  <button
                    key={family}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary/60"
                  >
                    <span className="font-display text-2xl italic leading-none">
                      Ag
                    </span>
                    <span className="text-sm text-muted-foreground">{family}</span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyAssets message="No brand fonts saved yet." />
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-0">
            <PanelHeading>Images</PanelHeading>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {images.map((image) => (
                  <div key={image.url} className="space-y-1">
                    <DragImage src={image.url} label={image.label} />
                    <Badge variant="secondary" className="w-full justify-center capitalize">
                      {image.source}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyAssets message="Image sources not connected yet." />
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <PanelHeading>Notes</PanelHeading>
            <button className="flex w-full items-center gap-2 rounded-xl bg-[hsl(45_90%_75%)] p-3 text-left text-sm font-medium text-[hsl(40_50%_15%)] shadow-sm transition-transform hover:scale-[1.02]">
              <Plus className="h-4 w-4" />
              Add a sticky note
            </button>
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );
}

function EmptyAssets({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
      {message}
    </p>
  );
}

function TabTrigger({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <TabsTrigger value={value} className="px-0" aria-label={label} title={label}>
      {icon}
    </TabsTrigger>
  );
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function DragImage({ src, label }: { src: string; label?: string }) {
  return (
    <div className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label ?? ""}
        draggable={false}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  );
}

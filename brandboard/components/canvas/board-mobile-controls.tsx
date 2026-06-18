"use client";

import { PanelLeft, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LeftPanelContent } from "@/components/canvas/left-panel";
import { RightPanelContent } from "@/components/canvas/right-panel";
import type { BoardSidebarAssets } from "@/lib/canvas/board-data";

type BoardMobileControlsProps = {
  sidebarAssets?: BoardSidebarAssets;
  summary?: string | null;
  recommendations?: string[];
};

export function BoardMobileControls({
  sidebarAssets,
  summary,
  recommendations,
}: BoardMobileControlsProps) {
  return (
    <div className="flex items-center gap-1 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open assets panel">
            <PanelLeft className="h-[18px] w-[18px]" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[88vw] max-w-xs p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle>Assets</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-3.25rem)]">
            <LeftPanelContent assets={sidebarAssets} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open insights panel">
            <Lightbulb className="h-[18px] w-[18px]" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[88vw] max-w-xs p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle>Insights</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-3.25rem)]">
            <RightPanelContent summary={summary} recommendations={recommendations} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

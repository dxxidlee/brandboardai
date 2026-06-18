"use client";

import { LeftPanel } from "@/components/canvas/left-panel";
import { RightPanel } from "@/components/canvas/right-panel";
import { MoodboardCanvas } from "@/components/canvas/moodboard-canvas";
import type { BoardSidebarAssets } from "@/lib/canvas/board-data";
import type { CanvasCard } from "@/lib/mock-data";

type BoardWorkspaceProps = {
  initialCards: CanvasCard[];
  sidebarAssets: BoardSidebarAssets;
  summary: string | null;
  recommendations: string[];
};

export function BoardWorkspace({
  initialCards,
  sidebarAssets,
  summary,
  recommendations,
}: BoardWorkspaceProps) {
  return (
    <div className="flex min-h-0 flex-1">
      <LeftPanel assets={sidebarAssets} />
      <div className="min-w-0 flex-1">
        <MoodboardCanvas initialCards={initialCards} />
      </div>
      <RightPanel summary={summary} recommendations={recommendations} />
    </div>
  );
}

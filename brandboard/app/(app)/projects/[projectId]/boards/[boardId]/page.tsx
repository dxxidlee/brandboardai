import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Share2, FileDown, Play, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BoardMobileControls } from "@/components/canvas/board-mobile-controls";
import { BoardWorkspace } from "@/components/canvas/board-workspace";
import { getBoardCanvasPageData } from "@/lib/queries/board-canvas";

export default async function BoardCanvasPage({
  params,
}: {
  params: Promise<{ projectId: string; boardId: string }>;
}) {
  const { projectId, boardId } = await params;
  const data = await getBoardCanvasPageData(projectId, boardId);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={`/projects/${projectId}`} aria-label="Back to audit">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="truncate text-muted-foreground">{data.projectName}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">{data.boardName}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground lg:flex">
            <Check className="h-3.5 w-3.5 text-[hsl(140_50%_45%)]" />
            {data.hasBrandAssets ? "Brand assets loaded" : "Saved"}
          </span>
          <BoardMobileControls
            sidebarAssets={data.sidebarAssets}
            summary={data.summary}
            recommendations={data.recommendations}
          />
          <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Share">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Present</span>
          </Button>
        </div>
      </header>

      <BoardWorkspace
        initialCards={data.initialCards}
        sidebarAssets={data.sidebarAssets}
        summary={data.summary}
        recommendations={data.recommendations}
      />
    </div>
  );
}

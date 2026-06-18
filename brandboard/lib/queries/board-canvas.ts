import "server-only";

import {
  buildCanvasCardsFromItems,
  buildSidebarAssetsFromProjectAssets,
} from "@/lib/canvas/board-data";
import { parseAuditInsights } from "@/types/domain";
import { createClient } from "@/lib/supabase/server";

export type BoardCanvasPageData = {
  projectId: string;
  projectName: string;
  boardName: string;
  summary: string | null;
  recommendations: string[];
  initialCards: ReturnType<typeof buildCanvasCardsFromItems>;
  sidebarAssets: ReturnType<typeof buildSidebarAssetsFromProjectAssets>;
  hasBrandAssets: boolean;
};

export async function getBoardCanvasPageData(
  projectId: string,
  boardId: string
): Promise<BoardCanvasPageData | null> {
  const supabase = await createClient();

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id, name, project_id")
    .eq("id", boardId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (boardError || !board) return null;

  const [{ data: project }, { data: assets }, { data: canvasItems }, { data: audit }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .maybeSingle(),
      supabase.from("assets").select("*").eq("project_id", projectId),
      supabase
        .from("canvas_items")
        .select("*")
        .eq("board_id", boardId)
        .order("z_index", { ascending: true }),
      supabase
        .from("audit_results")
        .select("summary, insights")
        .eq("project_id", projectId)
        .maybeSingle(),
    ]);

  const parsedInsights = parseAuditInsights(audit?.insights);
  const recommendations = parsedInsights.insights
    .filter((item) => item.tag === "Recommendation")
    .map((item) => item.body)
    .slice(0, 4);

  const sidebarAssets = buildSidebarAssetsFromProjectAssets(assets ?? []);
  const initialCards = buildCanvasCardsFromItems(canvasItems ?? [], assets ?? []);

  return {
    projectId,
    projectName: project?.title ?? "Project",
    boardName: board.name,
    summary: audit?.summary ?? null,
    recommendations,
    initialCards,
    sidebarAssets,
    hasBrandAssets: (assets ?? []).some((asset) => asset.source === "brandfetch"),
  };
}

import { Sparkles, Lightbulb } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CANVAS_PROJECT } from "@/lib/mock-data";

type RightPanelProps = {
  summary?: string | null;
  recommendations?: string[];
};

export function RightPanel({ summary, recommendations }: RightPanelProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-card/40 lg:flex">
      <RightPanelContent summary={summary} recommendations={recommendations} />
    </aside>
  );
}

export function RightPanelContent({
  summary,
  recommendations,
}: RightPanelProps) {
  const displaySummary = summary ?? CANVAS_PROJECT.summary;
  const displayRecommendations =
    recommendations && recommendations.length > 0
      ? recommendations
      : CANVAS_PROJECT.recommendations;

  return (
    <ScrollArea className="h-full flex-1">
      <div className="space-y-6 p-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Brand summary</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {displaySummary}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[hsl(40_90%_45%)]" />
            <h3 className="text-sm font-semibold">Recommendations</h3>
          </div>
          <ul className="space-y-2.5">
            {displayRecommendations.map((rec, i) => (
              <li
                key={i}
                className="flex gap-2.5 rounded-xl border border-border bg-card p-3 text-sm leading-snug transition-colors hover:border-primary/30"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {!summary && (
          <div className="rounded-xl border border-dashed border-border p-4 text-center">
            <p className="text-sm font-medium">Generated insights</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              AI insights update as you refine the board.
            </p>
            <Badge variant="accent" className="mt-3">
              Mock data
            </Badge>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

import { z } from "zod";

export const confidenceLevelSchema = z.enum(["high", "medium", "low"]);

const flexibleString = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") return value.trim();
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }
      return value;
    },
    z.string().min(1).max(max)
  );

export const competitorSchema = z.object({
  name: flexibleString(120),
  note: flexibleString(500),
  url: z
    .preprocess(
      (value) => (value == null || value === "" ? undefined : value),
      z.string().optional()
    )
    .optional(),
});

export const insightItemSchema = z.object({
  title: flexibleString(120),
  body: flexibleString(500),
});

export const brandAuditOutputSchema = z.object({
  summary: flexibleString(320),
  mission: flexibleString(200),
  positioning: flexibleString(200),
  tone: flexibleString(120),
  audience: flexibleString(200),
  competitors: z.array(competitorSchema).min(1).max(3),
  opportunities: z.array(insightItemSchema).min(1).max(2),
  creative_recommendations: z.array(insightItemSchema).min(1).max(2),
  confidence_level: confidenceLevelSchema,
  assumptions: z.array(flexibleString(120)).min(1).max(3),
  needs_research: z.array(flexibleString(120)).min(1).max(3),
});

export type BrandAuditOutput = z.infer<typeof brandAuditOutputSchema>;
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

export type StoredInsight = {
  tag: "Opportunity" | "Recommendation";
  title: string;
  body: string;
};

/** Structured insights payload stored in audit_results.insights jsonb. */
export type StoredAuditInsights = {
  confidence_level: ConfidenceLevel;
  assumptions: string[];
  needs_research: string[];
  items: StoredInsight[];
  source?: "debug_mock";
  validation_warnings?: string[];
};

export function mapAuditOutputToDb(
  output: BrandAuditOutput,
  options?: { validationWarnings?: string[] }
) {
  const items: StoredInsight[] = [
    ...output.opportunities.map((item) => ({
      tag: "Opportunity" as const,
      title: item.title,
      body: item.body,
    })),
    ...output.creative_recommendations.map((item) => ({
      tag: "Recommendation" as const,
      title: item.title,
      body: item.body,
    })),
  ];

  const insights: StoredAuditInsights = {
    confidence_level: output.confidence_level,
    assumptions: output.assumptions,
    needs_research: output.needs_research,
    items,
    ...(options?.validationWarnings?.length
      ? { validation_warnings: options.validationWarnings }
      : {}),
  };

  return {
    summary: output.summary,
    mission: output.mission,
    positioning: output.positioning,
    tone: output.tone,
    audience: output.audience,
    competitors: output.competitors,
    insights,
  };
}

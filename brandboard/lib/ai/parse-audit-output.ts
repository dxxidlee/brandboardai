import "server-only";

import { z } from "zod";

import type { BrandAuditOutput, ConfidenceLevel } from "@/lib/ai/schemas";
import {
  brandAuditOutputSchema,
  competitorSchema,
  insightItemSchema,
} from "@/lib/ai/schemas";

export type ParseAuditResult = {
  output: BrandAuditOutput;
  warnings: string[];
  usedFallback: boolean;
};

type InsightBucket = "opportunities" | "creative_recommendations";

const DEFAULT_ASSUMPTIONS = [
  "Brand details inferred from the research prompt",
  "Category norms used where live data was unavailable",
];

const DEFAULT_NEEDS_RESEARCH = [
  "Verify current tagline and homepage messaging",
  "Confirm visual identity and social presence",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const coerced = coerceString(item);
      if (coerced) return coerced;
    }
  }
  return null;
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
}

function coerceStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => coerceString(item))
      .filter((item): item is string => Boolean(item))
      .map((item) => truncate(item, 120));
    if (items.length > 0) return items.slice(0, 3);
  }

  const single = coerceString(value);
  if (!single) return fallback;

  const split = single
    .split(/\n|•|·|;/)
    .map((part) => part.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  if (split.length > 1) {
    return split.slice(0, 3).map((item) => truncate(item, 120));
  }

  return [truncate(single, 120)];
}

function normalizeConfidence(value: unknown): ConfidenceLevel {
  const raw = coerceString(value)?.toLowerCase();
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  if (raw?.includes("high")) return "high";
  if (raw?.includes("low")) return "low";
  return "medium";
}

function pickField(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

function normalizeInsightTag(value: unknown): InsightBucket | null {
  const raw = coerceString(value)?.toLowerCase() ?? "";
  if (!raw) return null;
  if (
    raw.includes("recommend") ||
    raw.includes("creative") ||
    raw.includes("action")
  ) {
    return "creative_recommendations";
  }
  if (
    raw.includes("opportun") ||
    raw.includes("strength") ||
    raw.includes("insight")
  ) {
    return "opportunities";
  }
  return null;
}

function parseInsightItem(value: unknown): z.infer<typeof insightItemSchema> | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const [title, ...rest] = trimmed.split(/[:\-–]/);
    if (rest.length > 0 && title.trim()) {
      return {
        title: truncate(title.trim(), 120),
        body: truncate(rest.join("-").trim() || trimmed, 500),
      };
    }
    return {
      title: truncate(trimmed.slice(0, 80), 120),
      body: truncate(trimmed, 500),
    };
  }

  if (!isRecord(value)) return null;

  const title =
    coerceString(
      pickField(value, ["title", "name", "heading", "label"])
    ) ?? coerceString(value.summary);
  const body =
    coerceString(
      pickField(value, ["body", "description", "detail", "text", "content"])
    ) ?? coerceString(value.summary);

  if (!title || !body) return null;

  return {
    title: truncate(title, 120),
    body: truncate(body, 500),
  };
}

function parseInsightList(
  value: unknown,
  bucket: InsightBucket,
  warnings: string[],
  fieldName: string
): z.infer<typeof insightItemSchema>[] {
  const parsed: z.infer<typeof insightItemSchema>[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      const insight = parseInsightItem(item);
      if (insight) parsed.push(insight);
    }
  } else {
    const single = parseInsightItem(value);
    if (single) parsed.push(single);
  }

  if (parsed.length === 0) {
    warnings.push(`${fieldName} was missing or malformed — using default`);
  }

  return parsed.slice(0, 2);
}

function parseCombinedInsights(
  value: unknown,
  warnings: string[]
): {
  opportunities: z.infer<typeof insightItemSchema>[];
  creative_recommendations: z.infer<typeof insightItemSchema>[];
} {
  const opportunities: z.infer<typeof insightItemSchema>[] = [];
  const creative_recommendations: z.infer<typeof insightItemSchema>[] = [];

  if (!Array.isArray(value)) {
    return { opportunities, creative_recommendations };
  }

  for (const item of value) {
    const insight = parseInsightItem(item);
    if (!insight) continue;

    const tag = isRecord(item)
      ? normalizeInsightTag(pickField(item, ["tag", "type", "category", "kind"]))
      : null;

    if (tag === "creative_recommendations") {
      creative_recommendations.push(insight);
    } else if (tag === "opportunities") {
      opportunities.push(insight);
    } else if (creative_recommendations.length <= opportunities.length) {
      creative_recommendations.push(insight);
    } else {
      opportunities.push(insight);
    }
  }

  if (opportunities.length === 0 && creative_recommendations.length === 0) {
    warnings.push("Combined insights array was malformed — using defaults");
  }

  return {
    opportunities: opportunities.slice(0, 2),
    creative_recommendations: creative_recommendations.slice(0, 2),
  };
}

function parseCompetitors(
  value: unknown,
  warnings: string[]
): z.infer<typeof competitorSchema>[] {
  const parsed: z.infer<typeof competitorSchema>[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const [name, ...rest] = trimmed.split(/[:\-–]/);
        parsed.push({
          name: truncate((name ?? trimmed).trim(), 120),
          note: truncate(rest.join("-").trim() || "Competes in the same category.", 500),
        });
        continue;
      }

      if (!isRecord(item)) continue;

      const name = coerceString(pickField(item, ["name", "company", "brand"]));
      const note =
        coerceString(pickField(item, ["note", "positioning", "angle", "summary"])) ??
        coerceString(item.description);
      const url = coerceString(pickField(item, ["url", "website", "link"])) ?? undefined;

      if (!name) continue;

      parsed.push({
        name: truncate(name, 120),
        note: truncate(note ?? "Competes in the same category.", 500),
        ...(url ? { url } : {}),
      });
    }
  } else {
    const single = coerceString(value);
    if (single) {
      parsed.push({
        name: truncate(single, 120),
        note: "Competes in the same category — verify with research.",
      });
    }
  }

  if (parsed.length === 0) {
    warnings.push("competitors was missing or malformed — using default");
    return [
      {
        name: "Category peer",
        note: "Competes in the same general category — verify with research.",
      },
    ];
  }

  return parsed.slice(0, 3);
}

function defaultOpportunities(
  brandName: string
): z.infer<typeof insightItemSchema>[] {
  return [
    {
      title: "Sharpen differentiation",
      body: truncate(
        `Clarify what makes ${brandName} distinct beyond category table stakes.`,
        500
      ),
    },
  ];
}

function defaultRecommendations(
  brandName: string
): z.infer<typeof insightItemSchema>[] {
  return [
    {
      title: "Unify brand story",
      body: truncate(
        `Align ${brandName}'s messaging, visuals, and proof points across key channels.`,
        500
      ),
    },
  ];
}

function buildFallbackOutput(brandName: string, warnings: string[]): BrandAuditOutput {
  warnings.push("Using full fallback audit output");
  return {
    summary: truncate(
      `${brandName} strategic audit draft. Key details should be verified before acting on this report.`,
      320
    ),
    mission: truncate(
      `Deliver ${brandName}'s core brand promise with clarity and consistency.`,
      200
    ),
    positioning: truncate(
      `${brandName} likely positions itself on experience and trust within its category.`,
      200
    ),
    tone: "Confident, approachable, modern",
    audience: truncate(
      `Primary audience likely includes customers who value the core promise of ${brandName}.`,
      200
    ),
    competitors: parseCompetitors([], warnings),
    opportunities: defaultOpportunities(brandName),
    creative_recommendations: defaultRecommendations(brandName),
    confidence_level: "low",
    assumptions: [...DEFAULT_ASSUMPTIONS],
    needs_research: [...DEFAULT_NEEDS_RESEARCH],
  };
}

export function formatValidationIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}

export function parseAndNormalizeAuditOutput(
  raw: unknown,
  context: { brandName?: string; prompt?: string } = {}
): ParseAuditResult {
  const warnings: string[] = [];
  const brandName =
    context.brandName ??
    (context.prompt
      ? context.prompt.replace(/^audit\s+/i, "").trim() || "This brand"
      : "This brand");

  if (!isRecord(raw)) {
    return {
      output: buildFallbackOutput(brandName, warnings),
      warnings,
      usedFallback: true,
    };
  }

  const combined = parseCombinedInsights(
    pickField(raw, ["insights", "insight_items", "items"]),
    warnings
  );

  let opportunities = parseInsightList(
    pickField(raw, ["opportunities", "opportunity", "opportunity_areas"]),
    "opportunities",
    warnings,
    "opportunities"
  );
  if (opportunities.length === 0 && combined.opportunities.length > 0) {
    opportunities = combined.opportunities;
  }
  if (opportunities.length === 0) {
    opportunities = defaultOpportunities(brandName);
  }

  let creative_recommendations = parseInsightList(
    pickField(raw, [
      "creative_recommendations",
      "recommendations",
      "creativeRecommendations",
      "creative_recs",
    ]),
    "creative_recommendations",
    warnings,
    "creative_recommendations"
  );
  if (
    creative_recommendations.length === 0 &&
    combined.creative_recommendations.length > 0
  ) {
    creative_recommendations = combined.creative_recommendations;
  }
  if (creative_recommendations.length === 0) {
    creative_recommendations = defaultRecommendations(brandName);
  }

  const summary =
    coerceString(
      pickField(raw, ["summary", "overview", "executive_summary", "synopsis"])
    ) ??
    coerceString(pickField(raw, ["description"])) ??
    truncate(
      `${brandName} strategic audit draft generated from the research prompt.`,
      320
    );

  const mission =
    coerceString(pickField(raw, ["mission", "purpose", "brand_mission"])) ??
    truncate(`Advance ${brandName}'s core brand promise with consistency.`, 200);

  const positioning =
    coerceString(
      pickField(raw, ["positioning", "position", "market_position", "positioning_statement"])
    ) ??
    truncate(`${brandName} likely competes on experience within its category.`, 200);

  const toneRaw = pickField(raw, ["tone", "voice", "brand_voice", "personality"]);
  const tone =
    (Array.isArray(toneRaw)
      ? toneRaw.map((item) => coerceString(item)).filter(Boolean).join(", ")
      : coerceString(toneRaw)) ?? "Confident, approachable";

  const audience =
    coerceString(
      pickField(raw, ["audience", "target_audience", "targetAudience", "customers"])
    ) ??
    truncate(`Primary audience likely aligned with ${brandName}'s core offer.`, 200);

  const normalized: BrandAuditOutput = {
    summary: truncate(summary, 320),
    mission: truncate(mission, 200),
    positioning: truncate(positioning, 200),
    tone: truncate(tone, 120),
    audience: truncate(audience, 200),
    competitors: parseCompetitors(
      pickField(raw, ["competitors", "competition", "competitive_set"]),
      warnings
    ),
    opportunities,
    creative_recommendations,
    confidence_level: normalizeConfidence(
      pickField(raw, ["confidence_level", "confidenceLevel", "confidence"])
    ),
    assumptions: coerceStringArray(
      pickField(raw, ["assumptions", "assumption", "inferences"]),
      DEFAULT_ASSUMPTIONS
    ),
    needs_research: coerceStringArray(
      pickField(raw, ["needs_research", "needsResearch", "research_gaps", "open_questions"]),
      DEFAULT_NEEDS_RESEARCH
    ),
  };

  const validated = brandAuditOutputSchema.safeParse(normalized);
  if (validated.success) {
    return {
      output: validated.data,
      warnings,
      usedFallback: warnings.length > 0,
    };
  }

  warnings.push(
    `Normalized output still had schema issues:\n${formatValidationIssues(validated.error.issues)}`
  );

  return {
    output: buildFallbackOutput(brandName, warnings),
    warnings,
    usedFallback: true,
  };
}

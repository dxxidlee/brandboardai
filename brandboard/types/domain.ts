import type { Insight } from "@/lib/mock-data";
import type { ConfidenceLevel, StoredAuditInsights } from "@/lib/ai/schemas";

export type { ConfidenceLevel };
import type { ProjectBrandAssets } from "@/types/brand-assets";
import type { AuditResult, Board, Project } from "@/types/database.types";

export type DbCompetitor = {
  name: string;
  note: string;
  url?: string;
};

export type ProjectAuditView = {
  project: Project;
  audit: AuditResult;
  board: Board | null;
  personality: string[];
  competitors: Array<{
    name: string;
    positioning: string;
    initial: string;
    accent: string;
  }>;
  insights: Insight[];
  audience: string | null;
  confidenceLevel: ConfidenceLevel | null;
  assumptions: string[];
  needsResearch: string[];
  brandAssets: ProjectBrandAssets;
  isDebugMock: boolean;
};

export function parsePersonality(tone: string | null): string[] {
  if (!tone) return [];
  return tone
    .split(/[,;|/]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseCompetitors(raw: unknown): ProjectAuditView["competitors"] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : "";
      const note =
        typeof record.note === "string"
          ? record.note
          : typeof record.positioning === "string"
            ? record.positioning
            : "";
      if (!name) return null;
      return {
        name,
        positioning: note,
        initial: name.charAt(0).toUpperCase(),
        accent: hashColor(name),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);
}

const INSIGHT_TAGS: Insight["tag"][] = [
  "Opportunity",
  "Strength",
  "Risk",
  "Recommendation",
];

function parseInsightItems(raw: unknown): Insight[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const tag = record.tag;
      const title = typeof record.title === "string" ? record.title : "";
      const body = typeof record.body === "string" ? record.body : "";
      if (!title || !body || !INSIGHT_TAGS.includes(tag as Insight["tag"])) {
        return null;
      }
      return { tag: tag as Insight["tag"], title, body };
    })
    .filter((i): i is Insight => i !== null);
}

function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return value === "high" || value === "medium" || value === "low";
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
}

/** Parses structured insights jsonb (new format) or legacy insight arrays. */
export function parseAuditInsights(raw: unknown): {
  insights: Insight[];
  confidenceLevel: ConfidenceLevel | null;
  assumptions: string[];
  needsResearch: string[];
  isDebugMock: boolean;
} {
  if (Array.isArray(raw)) {
    return {
      insights: parseInsightItems(raw),
      confidenceLevel: null,
      assumptions: [],
      needsResearch: [],
      isDebugMock: false,
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      insights: [],
      confidenceLevel: null,
      assumptions: [],
      needsResearch: [],
      isDebugMock: false,
    };
  }

  const record = raw as StoredAuditInsights & { source?: string };
  return {
    insights: parseInsightItems(record.items),
    confidenceLevel: isConfidenceLevel(record.confidence_level)
      ? record.confidence_level
      : null,
    assumptions: parseStringArray(record.assumptions),
    needsResearch: parseStringArray(record.needs_research),
    isDebugMock: record.source === "debug_mock",
  };
}

/** @deprecated Use parseAuditInsights */
export function parseInsights(raw: unknown): Insight[] {
  return parseAuditInsights(raw).insights;
}

function hashColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 42%)`;
}

export function logoColorFromTitle(title: string): string {
  return hashColor(title);
}

export const CONFIDENCE_LABELS: Record<
  ConfidenceLevel,
  { label: string; description: string }
> = {
  high: {
    label: "High confidence",
    description: "Strong category knowledge; fewer open questions.",
  },
  medium: {
    label: "Medium confidence",
    description: "Useful draft direction; verify key facts before acting.",
  },
  low: {
    label: "Low confidence",
    description: "Heavy inference — treat as a starting point only.",
  },
};

import "server-only";

import type { BrandAuditOutput } from "@/lib/ai/schemas";
import { mapAuditOutputToDb } from "@/lib/ai/schemas";
import type { Json } from "@/types/database.types";

const MOCK_COLOR_PALETTE: Json = [
  { hex: "#FF5A5F", name: "Primary", role: "Brand" },
  { hex: "#484848", name: "Dark", role: "Text" },
  { hex: "#767676", name: "Secondary", role: "Accent" },
  { hex: "#F7F7F7", name: "Background", role: "Background" },
];

const MOCK_TYPOGRAPHY: Json = [
  { family: "Circular", role: "Display", source: "Mock" },
  { family: "Inter", role: "Body", source: "Mock" },
];

export function buildMockAuditOutput(brandName: string): BrandAuditOutput {
  return {
    summary: `${brandName} reads as a design-forward brand with a clear guest-or-customer promise. This mock audit simulates a strategist draft — verify live branding before acting on it.`,
    mission: `Deliver ${brandName}'s core experience with warmth, trust, and consistent quality at every touchpoint.`,
    positioning: `${brandName} likely competes on experience and brand trust rather than price alone, sitting between mass-market alternatives and premium specialists.`,
    tone: "Warm, confident, approachable, modern",
    audience: `Primary audience likely includes experience-driven consumers who value convenience, clarity, and a recognizable brand promise.`,
    competitors: [
      {
        name: "Category peer A",
        note: "Competes on breadth of inventory and brand recognition.",
      },
      {
        name: "Category peer B",
        note: "Competes on premium positioning and curated selection.",
      },
    ],
    opportunities: [
      {
        title: "Sharpen differentiation story",
        body: `Clarify what makes ${brandName} distinct beyond category table stakes — one hero message across site, app, and social.`,
      },
    ],
    creative_recommendations: [
      {
        title: "Unify visual system",
        body: "Tighten logo, color, and typography usage into a single reference page before the next campaign sprint.",
      },
    ],
    confidence_level: "medium",
    assumptions: [
      `Brand name "${brandName}" inferred from the research prompt`,
      "Category norms used in place of live brand research",
      "No verified visual identity or social data was fetched",
    ],
    needs_research: [
      "Confirm current tagline and homepage messaging",
      "Verify official logo, colors, and typography",
      "Validate primary audience segments with real data",
    ],
  };
}

export function buildMockAuditDbPayload(brandName: string) {
  const mapped = mapAuditOutputToDb(buildMockAuditOutput(brandName));
  return {
    ...mapped,
    insights: {
      ...mapped.insights,
      source: "debug_mock" as const,
    },
    color_palette: MOCK_COLOR_PALETTE,
    typography: MOCK_TYPOGRAPHY,
  };
}

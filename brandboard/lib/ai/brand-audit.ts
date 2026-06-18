import "server-only";

import { deriveTitle } from "@/lib/pipeline/derive-title";
import {
  parseAndNormalizeAuditOutput,
} from "@/lib/ai/parse-audit-output";
import type { BrandAuditOutput } from "@/lib/ai/schemas";
import { getOpenAIClient } from "@/lib/ai/openai";

/** Fast, cost-efficient model for MVP audits. */
export const AUDIT_MODEL = "gpt-4.1-nano";

const SYSTEM_PROMPT = `You are a brand strategist writing a concise draft audit from a short prompt. No live web access or verified data.

Rules:
- Do not invent revenue, followers, taglines, or market share.
- Hedge with "likely" / "typically" when inferring.
- Keep every field brief (1-2 sentences max; bullets where noted).
- confidence_level: high | medium | low based on prompt clarity.
- assumptions: 2-3 short bullets of what you inferred.
- needs_research: 2-3 items to verify later.
- competitors: 2-3 plausible peers, angle only.
- opportunities & creative_recommendations: 2 items each, one sentence body.

Return ONLY valid JSON with keys:
summary, mission, positioning, tone, audience, competitors, opportunities, creative_recommendations, confidence_level, assumptions, needs_research`;

const MAX_OUTPUT_TOKENS = 700;

export type BrandAuditGenerationResult = {
  output: BrandAuditOutput;
  rawJson: string;
  warnings: string[];
  usedFallback: boolean;
};

function logValidationFailure(rawJson: string, warnings: string[]) {
  console.error("[brand-audit] OpenAI output required normalization/fallback");
  console.error("[brand-audit] Raw OpenAI JSON:", rawJson);
  if (warnings.length > 0) {
    console.error("[brand-audit] Validation issues:\n" + warnings.join("\n"));
  }
  if (process.env.NODE_ENV === "development") {
    console.error(
      "[brand-audit] Dev summary:",
      warnings.length > 0 ? warnings.join(" | ") : "Malformed JSON shape"
    );
  }
}

export async function generateBrandAudit(input: {
  prompt: string;
  inputType: string;
  timeoutMs?: number;
}): Promise<BrandAuditGenerationResult> {
  const openai = getOpenAIClient();
  const timeoutMs = input.timeoutMs ?? 45_000;
  const brandName = deriveTitle(input.prompt);

  const userPrompt = `Type: ${input.inputType}\nPrompt: ${input.prompt}\n\nDraft a concise strategic audit. No social metrics or visual specs unless given.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const completion = await openai.chat.completions.create(
      {
        model: AUDIT_MODEL,
        temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      },
      { signal: controller.signal }
    );

    const rawJson = completion.choices[0]?.message?.content ?? "";
    if (!rawJson.trim()) {
      throw new Error("OpenAI returned an empty response.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (parseError) {
      logValidationFailure(rawJson, [
        `Invalid JSON: ${
          parseError instanceof Error ? parseError.message : "parse failed"
        }`,
      ]);
      const fallback = parseAndNormalizeAuditOutput(null, {
        brandName,
        prompt: input.prompt,
      });
      return {
        output: fallback.output,
        rawJson,
        warnings: fallback.warnings,
        usedFallback: true,
      };
    }

    const normalized = parseAndNormalizeAuditOutput(parsed, {
      brandName,
      prompt: input.prompt,
    });

    if (normalized.usedFallback || normalized.warnings.length > 0) {
      logValidationFailure(rawJson, normalized.warnings);
    }

    return {
      output: normalized.output,
      rawJson,
      warnings: normalized.warnings,
      usedFallback: normalized.usedFallback,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenAI request aborted after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

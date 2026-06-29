import "server-only";

import { getOpenAIClient } from "@/lib/ai/openai";
import type { ProjectAuditView } from "@/types/domain";

/** Fast, cost-efficient model — mirrors the audit pipeline. */
export const CHAT_MODEL = "gpt-4.1-nano";

const MAX_OUTPUT_TOKENS = 450;
const MAX_HISTORY = 10;

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

/** Builds a compact, factual context block from the stored audit + assets. */
function buildContext(data: ProjectAuditView): string {
  const { project, audit, personality, competitors, insights, audience, brandAssets } =
    data;

  const lines: string[] = [];
  lines.push(`Brand: ${project.title}`);
  if (project.input_prompt) lines.push(`Original request: ${project.input_prompt}`);
  if (audit.summary) lines.push(`Summary: ${audit.summary}`);
  if (audit.mission) lines.push(`Mission: ${audit.mission}`);
  if (audit.positioning) lines.push(`Positioning: ${audit.positioning}`);
  if (personality.length > 0) lines.push(`Personality: ${personality.join(", ")}`);
  if (audience) lines.push(`Audience: ${audience}`);

  if (competitors.length > 0) {
    lines.push(
      `Competitors: ${competitors
        .map((c) => `${c.name} (${c.positioning})`)
        .join("; ")}`
    );
  }

  if (insights.length > 0) {
    lines.push(
      `Insights:\n${insights
        .map((i) => `- [${i.tag}] ${i.title}: ${i.body}`)
        .join("\n")}`
    );
  }

  if (brandAssets.connected) {
    if (brandAssets.websiteUrl) lines.push(`Website: ${brandAssets.websiteUrl}`);
    if (brandAssets.description)
      lines.push(`Brand description: ${brandAssets.description}`);
    if (brandAssets.colors.length > 0) {
      lines.push(
        `Colors: ${brandAssets.colors
          .map((c) => `${c.name} ${c.hex} (${c.role})`)
          .join(", ")}`
      );
    }
    if (brandAssets.fonts.length > 0) {
      lines.push(
        `Typography: ${brandAssets.fonts
          .map((f) => `${f.family} (${f.role})`)
          .join(", ")}`
      );
    }
    lines.push(`Reference images available: ${brandAssets.images.length}`);
  } else {
    lines.push("Brand assets (logo/colors/fonts) are not connected for this brand.");
  }

  return lines.join("\n");
}

const SYSTEM_RULES = `You are Brandboard AI, an expert brand strategist embedded in a project workspace.
Answer the user's follow-up questions about this brand using the CONTEXT below plus general branding expertise.

Rules:
- Be concise and useful: 2-5 sentences or a short bullet list.
- Ground answers in the provided context; don't contradict it.
- Do NOT invent hard numbers (revenue, followers, market share) or claim live/real-time data.
- If asked for something you don't have yet (current social metrics, live campaigns, new generated images, editing the board), briefly say it's not available yet and offer what you can from the context.
- Write in a clear, confident, modern strategist voice.`;

/**
 * Generates a concise assistant reply for a project follow-up, grounded in the
 * stored audit + Brandfetch context and recent chat history.
 */
export async function generateBrandChatReply(input: {
  audit: ProjectAuditView;
  history: ChatTurn[];
  message: string;
  timeoutMs?: number;
}): Promise<string> {
  const openai = getOpenAIClient();
  const timeoutMs = input.timeoutMs ?? 30_000;
  const context = buildContext(input.audit);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const recentHistory = input.history.slice(-MAX_HISTORY);

  try {
    const completion = await openai.chat.completions.create(
      {
        model: CHAT_MODEL,
        temperature: 0.5,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          { role: "system", content: `${SYSTEM_RULES}\n\nCONTEXT:\n${context}` },
          ...recentHistory.map((turn) => ({
            role: turn.role,
            content: turn.content,
          })),
          { role: "user", content: input.message },
        ],
      },
      { signal: controller.signal }
    );

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("OpenAI returned an empty response.");
    }
    return reply;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenAI request aborted after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

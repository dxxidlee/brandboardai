import "server-only";

import type { Database } from "@/types/database.types";
import { deriveTitle } from "@/lib/pipeline/derive-title";

type ProjectInputType = Database["public"]["Enums"]["project_input_type"];

const DOMAIN_RE =
  /^(?:https?:\/\/)?(?:www\.)?([a-z0-9][-a-z0-9]*(?:\.[a-z0-9][-a-z0-9]*)+)(?:[/:?#]|$)/i;

function normalizeDomain(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  const match = trimmed.match(DOMAIN_RE);
  if (match?.[1]) {
    return match[1].replace(/\.+$/, "");
  }

  if (/^[a-z0-9][-a-z0-9]*(\.[a-z0-9][-a-z0-9]*)+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^audit\s+/i, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 48);
}

function inferDomainCandidates(prompt: string): string[] {
  const title = deriveTitle(prompt);
  const slug = slugFromName(title);
  if (!slug) return [];

  const candidates = [`${slug}.com`];

  if (slug.endsWith("s") && slug.length > 3) {
    candidates.push(`${slug.slice(0, -1)}.com`);
  }

  return candidates;
}

export function resolveDomainFromPrompt(
  prompt: string,
  inputType: ProjectInputType
): string | null {
  const trimmed = prompt.trim();
  if (!trimmed) return null;

  if (inputType === "url") {
    return normalizeDomain(trimmed);
  }

  const direct = normalizeDomain(trimmed);
  if (direct) return direct;

  const candidates = inferDomainCandidates(trimmed);
  return candidates[0] ?? null;
}

export function extractDomainFromSearchResult(domainField: string): string {
  return normalizeDomain(domainField) ?? domainField.replace(/^https?:\/\//i, "").split("/")[0] ?? domainField;
}

import "server-only";

import { getBrandfetchConfig } from "@/lib/env/server";
import {
  brandfetchBrandSchema,
  brandfetchSearchResponseSchema,
  formatBrandfetchValidationIssues,
  type BrandfetchBrandImage,
  type BrandfetchBrandResponse,
  type BrandfetchProfile,
  type BrandfetchSearchResult,
} from "@/lib/integrations/brandfetch/schemas";
import {
  extractDomainFromSearchResult,
  resolveDomainFromPrompt,
} from "@/lib/integrations/brandfetch/resolve-domain";
import type { Database } from "@/types/database.types";

type ProjectInputType = Database["public"]["Enums"]["project_input_type"];

const BRANDFETCH_API = "https://api.brandfetch.io/v2";
const REQUEST_TIMEOUT_MS = 4_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function pickBestFormat(
  formats: Array<{ src: string; format?: string }>
): string | null {
  const ranked = [...formats].sort((a, b) => {
    const rank = (format?: string) =>
      format === "svg" ? 3 : format === "png" ? 2 : format === "webp" ? 1 : 0;
    return rank(b.format) - rank(a.format);
  });
  return ranked[0]?.src ?? null;
}

function pickLogoUrl(logos: BrandfetchBrandResponse["logos"]): string | null {
  if (!logos?.length) return null;

  const ranked = [...logos].sort((a, b) => {
    const score = (logo: NonNullable<typeof logos>[number]) => {
      let value = 0;
      if (logo.type === "logo") value += 4;
      if (logo.type === "symbol") value += 2;
      if (logo.theme === "light" || !logo.theme) value += 1;
      return value;
    };
    return score(b) - score(a);
  });

  for (const logo of ranked) {
    const best = pickBestFormat(logo.formats ?? []);
    if (best) return best;
  }

  return null;
}

function pickBrandImages(
  images: BrandfetchBrandResponse["images"]
): BrandfetchBrandImage[] {
  if (!images?.length) return [];

  return images
    .slice(0, 6)
    .map((image, index) => {
      const url = pickBestFormat(image.formats ?? []);
      if (!url) return null;
      const type = image.type ?? "brand";
      return {
        url,
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1) || `Image ${index + 1}`,
      };
    })
    .filter((image): image is BrandfetchBrandImage => image !== null);
}

function normalizeHex(hex: string): string {
  const value = hex.startsWith("#") ? hex : `#${hex}`;
  return value.toUpperCase();
}

function mapColorRole(type?: string): string {
  if (!type) return "Brand";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function mapFontRole(type?: string): string {
  if (type === "title") return "Display";
  if (type === "body") return "Body";
  return "Brand";
}

export function normalizeBrandfetchProfile(
  data: BrandfetchBrandResponse,
  domain: string
): BrandfetchProfile {
  const resolvedDomain = data.domain
    ? extractDomainFromSearchResult(data.domain)
    : domain;

  const colors =
    data.colors?.slice(0, 8).map((color, index) => ({
      hex: normalizeHex(color.hex),
      name: mapColorRole(color.type) || `Color ${index + 1}`,
      role: mapColorRole(color.type),
    })) ?? [];

  const fonts =
    data.fonts?.slice(0, 4).map((font) => ({
      family: font.name,
      role: mapFontRole(font.type),
      source: font.origin ?? "Brandfetch",
    })) ?? [];

  return {
    name: data.name ?? resolvedDomain,
    domain: resolvedDomain,
    websiteUrl: `https://${resolvedDomain}`,
    description: data.description ?? data.longDescription ?? null,
    logoUrl: pickLogoUrl(data.logos),
    colors,
    fonts,
    images: pickBrandImages(data.images),
  };
}

export async function searchBrandByName(
  name: string
): Promise<BrandfetchSearchResult | null> {
  const { clientId } = getBrandfetchConfig();
  if (!clientId) return null;

  const url = new URL(
    `${BRANDFETCH_API}/search/${encodeURIComponent(name)}`
  );
  url.searchParams.set("c", clientId);

  const response = await fetchWithTimeout(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const json: unknown = await response.json();
  const parsed = brandfetchSearchResponseSchema.safeParse(json);
  if (!parsed.success || parsed.data.length === 0) return null;

  return parsed.data[0] ?? null;
}

function parseBrandfetchResponse(json: unknown, domain: string): BrandfetchProfile {
  const parsed = brandfetchBrandSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "[brandfetch] Response validation issues:",
      formatBrandfetchValidationIssues(parsed.error.issues)
    );
    throw new Error(
      `Brandfetch response failed validation: ${formatBrandfetchValidationIssues(parsed.error.issues)}`
    );
  }

  return normalizeBrandfetchProfile(parsed.data, domain);
}

export async function fetchBrandByDomain(
  domain: string
): Promise<BrandfetchProfile | null> {
  const { apiKey } = getBrandfetchConfig();
  const url = `${BRANDFETCH_API}/brands/domain/${encodeURIComponent(domain)}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Brandfetch request failed (${response.status})`);
  }

  const json: unknown = await response.json();
  return parseBrandfetchResponse(json, domain);
}

export async function resolveAndFetchBrand(input: {
  prompt: string;
  inputType: ProjectInputType;
}): Promise<BrandfetchProfile | null> {
  const title = input.prompt.trim().replace(/^audit\s+/i, "");

  let domain = resolveDomainFromPrompt(input.prompt, input.inputType);

  if (!domain && title) {
    const searchHit = await searchBrandByName(title);
    if (searchHit?.domain) {
      domain = extractDomainFromSearchResult(searchHit.domain);
    }
  }

  if (!domain) return null;

  try {
    const profile = await fetchBrandByDomain(domain);
    if (profile) return profile;

    if (title && title !== domain) {
      const searchHit = await searchBrandByName(title);
      if (searchHit?.domain) {
        const searchDomain = extractDomainFromSearchResult(searchHit.domain);
        if (searchDomain !== domain) {
          return fetchBrandByDomain(searchDomain);
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

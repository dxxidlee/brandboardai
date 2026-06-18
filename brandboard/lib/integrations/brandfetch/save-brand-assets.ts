import "server-only";

import type { BrandfetchProfile } from "@/lib/integrations/brandfetch/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Asset, Json } from "@/types/database.types";

export type SavedBrandAssets = {
  connected: boolean;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  colors: BrandfetchProfile["colors"];
  fonts: BrandfetchProfile["fonts"];
  images: BrandfetchProfile["images"];
  colorPaletteJson: Json;
  typographyJson: Json;
  savedCount: number;
};

type AssetInsertRow = {
  project_id: string;
  type: "logo" | "color" | "font" | "note" | "image" | "reference";
  title: string | null;
  url: string | null;
  source: "brandfetch";
  metadata_json: Json;
};

function readHex(metadata: Json): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const hex = (metadata as Record<string, unknown>).hex;
  return typeof hex === "string" ? hex.toLowerCase() : null;
}

function readFontFamily(metadata: Json): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const family = (metadata as Record<string, unknown>).family;
  return typeof family === "string" ? family.toLowerCase() : null;
}

function isDuplicateAsset(
  existing: Pick<Asset, "type" | "title" | "url" | "metadata_json">[],
  row: AssetInsertRow
): boolean {
  if (row.url) {
    return existing.some((asset) => asset.url === row.url);
  }

  if (row.type === "color") {
    const hex = readHex(row.metadata_json);
    if (!hex) return false;
    return existing.some(
      (asset) => asset.type === "color" && readHex(asset.metadata_json) === hex
    );
  }

  if (row.type === "font") {
    const family = readFontFamily(row.metadata_json);
    if (!family) return false;
    return existing.some(
      (asset) => asset.type === "font" && readFontFamily(asset.metadata_json) === family
    );
  }

  if (row.type === "note" && row.title) {
    return existing.some(
      (asset) => asset.type === "note" && asset.title === row.title
    );
  }

  return false;
}

export async function saveBrandfetchAssets(
  projectId: string,
  profile: BrandfetchProfile
): Promise<SavedBrandAssets> {
  const admin = createAdminClient();

  const { data: existingAssets, error: existingError } = await admin
    .from("assets")
    .select("id, type, title, url, source, metadata_json")
    .eq("project_id", projectId);

  if (existingError) {
    throw new Error(`Failed to load existing assets: ${existingError.message}`);
  }

  const existing = existingAssets ?? [];
  const rows: AssetInsertRow[] = [];

  if (profile.logoUrl) {
    rows.push({
      project_id: projectId,
      type: "logo",
      title: `${profile.name} logo`,
      url: profile.logoUrl,
      source: "brandfetch",
      metadata_json: { domain: profile.domain, theme: "primary" },
    });
  }

  for (const color of profile.colors) {
    rows.push({
      project_id: projectId,
      type: "color",
      title: color.name,
      url: null,
      source: "brandfetch",
      metadata_json: {
        hex: color.hex,
        role: color.role,
        name: color.name,
      },
    });
  }

  for (const font of profile.fonts) {
    rows.push({
      project_id: projectId,
      type: "font",
      title: font.family,
      url: null,
      source: "brandfetch",
      metadata_json: {
        family: font.family,
        role: font.role,
        source: font.source,
      },
    });
  }

  for (const image of profile.images) {
    rows.push({
      project_id: projectId,
      type: "image",
      title: image.label,
      url: image.url,
      source: "brandfetch",
      metadata_json: {
        label: image.label,
        imageType: image.type,
        domain: profile.domain,
      },
    });
  }

  if (profile.description) {
    rows.push({
      project_id: projectId,
      type: "note",
      title: "Company description",
      url: profile.websiteUrl,
      source: "brandfetch",
      metadata_json: {
        description: profile.description,
        domain: profile.domain,
        websiteUrl: profile.websiteUrl,
      },
    });
  }

  const rowsToInsert = rows.filter((row) => !isDuplicateAsset(existing, row));

  if (rowsToInsert.length > 0) {
    const { error } = await admin.from("assets").insert(rowsToInsert);
    if (error) {
      throw new Error(`Failed to save Brandfetch assets: ${error.message}`);
    }
  }

  const colorPaletteJson = profile.colors.map((color) => ({
    hex: color.hex,
    name: color.name,
    role: color.role,
  }));

  const typographyJson = profile.fonts.map((font) => ({
    family: font.family,
    role: font.role,
    source: font.source,
  }));

  return {
    connected: rows.length > 0 || existing.some((asset) => asset.source === "brandfetch"),
    logoUrl: profile.logoUrl,
    websiteUrl: profile.websiteUrl,
    description: profile.description,
    colors: profile.colors,
    fonts: profile.fonts,
    images: profile.images,
    colorPaletteJson,
    typographyJson,
    savedCount: rowsToInsert.length,
  };
}

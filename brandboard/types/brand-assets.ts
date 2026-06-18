import type { ColorSwatch, TypeStyle } from "@/lib/mock-data";
import type { BrandfetchBrandImage } from "@/lib/integrations/brandfetch/schemas";
import type { Asset } from "@/types/database.types";

export type VisualReferenceImage = BrandfetchBrandImage & {
  source: string;
};

export type ProjectBrandAssets = {
  connected: boolean;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  colors: ColorSwatch[];
  fonts: TypeStyle[];
  images: VisualReferenceImage[];
};

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string
): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function parseBrandAssets(
  assets: Asset[],
  colorPaletteJson: unknown,
  typographyJson: unknown
): ProjectBrandAssets {
  const brandfetchAssets = assets.filter((asset) => asset.source === "brandfetch");

  if (brandfetchAssets.length === 0) {
    return {
      connected: false,
      logoUrl: null,
      websiteUrl: null,
      description: null,
      colors: [],
      fonts: [],
      images: [],
    };
  }

  const logo = brandfetchAssets.find((asset) => asset.type === "logo");
  const note = brandfetchAssets.find(
    (asset) => asset.type === "note" && asset.title === "Company description"
  );

  const noteMeta =
    note?.metadata_json && typeof note.metadata_json === "object"
      ? (note.metadata_json as Record<string, unknown>)
      : {};

  const colorsFromAssets = brandfetchAssets
    .filter((asset) => asset.type === "color")
    .map((asset) => {
      const meta =
        asset.metadata_json && typeof asset.metadata_json === "object"
          ? (asset.metadata_json as Record<string, unknown>)
          : {};
      const hex = readMetadataString(meta, "hex");
      if (!hex) return null;
      return {
        hex: hex.startsWith("#") ? hex : `#${hex}`,
        name: readMetadataString(meta, "name") ?? asset.title ?? "Brand color",
        role: readMetadataString(meta, "role") ?? "Brand",
      };
    })
    .filter((color): color is ColorSwatch => color !== null);

  const fontsFromAssets = brandfetchAssets
    .filter((asset) => asset.type === "font")
    .map((asset) => {
      const meta =
        asset.metadata_json && typeof asset.metadata_json === "object"
          ? (asset.metadata_json as Record<string, unknown>)
          : {};
      const family =
        readMetadataString(meta, "family") ?? asset.title ?? "Brand font";
      const role = readMetadataString(meta, "role") ?? "Brand";
      return {
        family,
        role,
        weight: "Regular",
        sample: family,
        source: readMetadataString(meta, "source") ?? "Brandfetch",
      };
    });

  const imagesFromAssets = brandfetchAssets
    .filter((asset) => asset.type === "image" && asset.url)
    .map((asset) => {
      const meta =
        asset.metadata_json && typeof asset.metadata_json === "object"
          ? (asset.metadata_json as Record<string, unknown>)
          : {};
      return {
        url: asset.url as string,
        label: readMetadataString(meta, "label") ?? asset.title ?? "Brand image",
        type: readMetadataString(meta, "imageType") ?? "brand",
        source: asset.source,
      };
    });

  const colorsFromAudit = parseColorPaletteJson(colorPaletteJson);
  const fontsFromAudit = parseTypographyJson(typographyJson);

  return {
    connected: true,
    logoUrl: logo?.url ?? null,
    websiteUrl:
      readMetadataString(noteMeta, "websiteUrl") ?? note?.url ?? null,
    description: readMetadataString(noteMeta, "description"),
    colors: colorsFromAudit.length > 0 ? colorsFromAudit : colorsFromAssets,
    fonts: fontsFromAudit.length > 0 ? fontsFromAudit : fontsFromAssets,
    images: imagesFromAssets,
  };
}

function parseColorPaletteJson(raw: unknown): ColorSwatch[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const hex = typeof record.hex === "string" ? record.hex : "";
      if (!hex) return null;
      return {
        hex: hex.startsWith("#") ? hex : `#${hex}`,
        name: typeof record.name === "string" ? record.name : "Brand color",
        role: typeof record.role === "string" ? record.role : "Brand",
      };
    })
    .filter((color): color is ColorSwatch => color !== null);
}

function parseTypographyJson(raw: unknown): TypeStyle[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const family = typeof record.family === "string" ? record.family : "";
      if (!family) return null;
      const role = typeof record.role === "string" ? record.role : "Brand";
      const source =
        typeof record.source === "string" ? record.source : "Brandfetch";
      return {
        family,
        role,
        weight: "Regular",
        sample: family,
        source,
      };
    })
    .filter((font): font is TypeStyle => font !== null);
}

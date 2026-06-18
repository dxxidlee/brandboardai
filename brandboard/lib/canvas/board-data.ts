import type { CanvasCard } from "@/lib/mock-data";
import type { Asset, CanvasItem } from "@/types/database.types";

function readDataString(
  data: unknown,
  key: string
): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function buildCanvasCardsFromItems(
  items: CanvasItem[],
  assets: Asset[]
): CanvasCard[] {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return items
    .map((item) => {
      const asset = item.asset_id ? assetMap.get(item.asset_id) : null;
      const base = {
        id: item.id,
        x: item.x,
        y: item.y,
        w: item.width,
        h: item.height,
        rotation: item.rotation,
      };

      switch (item.node_type) {
        case "section":
          return {
            ...base,
            kind: "section" as const,
            title: readDataString(item.data, "title") ?? "Section",
          };
        case "image": {
          const url =
            asset?.url ??
            readDataString(item.data, "url") ??
            "";
          if (!url) return null;
          return {
            ...base,
            kind: "image" as const,
            url,
            label:
              readDataString(item.data, "label") ??
              asset?.title ??
              "Image",
          };
        }
        case "color": {
          const hex =
            readDataString(item.data, "hex") ??
            readMetadataString(asset?.metadata_json, "hex") ??
            "#888888";
          return {
            ...base,
            kind: "color" as const,
            hex: hex.startsWith("#") ? hex : `#${hex}`,
            name:
              readDataString(item.data, "name") ??
              asset?.title ??
              "Brand color",
          };
        }
        case "text": {
          const family =
            readDataString(item.data, "family") ??
            readMetadataString(asset?.metadata_json, "family") ??
            asset?.title ??
            "Brand";
          return {
            ...base,
            kind: "type" as const,
            family,
            sample: readDataString(item.data, "sample") ?? family,
          };
        }
        case "note":
          return {
            ...base,
            kind: "note" as const,
            text:
              item.notes ??
              readDataString(item.data, "text") ??
              "Brand note",
          };
        default:
          return null;
      }
    })
    .filter((card): card is CanvasCard => card !== null);
}

export type BoardSidebarAssets = {
  logoUrl: string | null;
  colors: Array<{ hex: string; name: string }>;
  fonts: Array<{ family: string; role: string }>;
  images: Array<{ url: string; label: string; source: string }>;
};

export function buildSidebarAssetsFromProjectAssets(
  assets: Asset[]
): BoardSidebarAssets {
  const brandfetch = assets.filter((asset) => asset.source === "brandfetch");
  const logo = brandfetch.find((asset) => asset.type === "logo");

  return {
    logoUrl: logo?.url ?? null,
    colors: brandfetch
      .filter((asset) => asset.type === "color")
      .map((asset) => {
        const hex =
          readMetadataString(asset.metadata_json, "hex") ??
          "#888888";
        return {
          hex: hex.startsWith("#") ? hex : `#${hex}`,
          name: asset.title ?? "Brand color",
        };
      }),
    fonts: brandfetch
      .filter((asset) => asset.type === "font")
      .map((asset) => ({
        family:
          readMetadataString(asset.metadata_json, "family") ??
          asset.title ??
          "Brand font",
        role: readMetadataString(asset.metadata_json, "role") ?? "Brand",
      })),
    images: brandfetch
      .filter((asset) => asset.type === "image" && asset.url)
      .map((asset) => ({
        url: asset.url as string,
        label:
          readMetadataString(asset.metadata_json, "label") ??
          asset.title ??
          "Brand image",
        source: asset.source,
      })),
  };
}

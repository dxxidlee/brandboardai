import "server-only";

import { createStepTimer, logPipeline } from "@/lib/pipeline/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

type PopulateCanvasInput = {
  projectId: string;
  boardId: string;
};

type CanvasInsert = {
  board_id: string;
  asset_id: string | null;
  node_type: "image" | "color" | "text" | "note" | "section";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  notes: string | null;
  data: Json;
};

function readMetadataString(metadata: Json, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function populateCanvasFromAssets(input: PopulateCanvasInput) {
  const { projectId, boardId } = input;
  const timer = createStepTimer(projectId, "canvas population");
  const admin = createAdminClient();

  const { count, error: countError } = await admin
    .from("canvas_items")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId);

  if (countError) {
    throw new Error(`Failed to check canvas items: ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    timer.end({ skipped: true, reason: "canvas_already_populated" });
    return;
  }

  const { data: assets, error: assetsError } = await admin
    .from("assets")
    .select("*")
    .eq("project_id", projectId)
    .eq("source", "brandfetch");

  if (assetsError) {
    throw new Error(`Failed to load assets for canvas: ${assetsError.message}`);
  }

  const brandAssets = assets ?? [];
  if (brandAssets.length === 0) {
    timer.end({ skipped: true, reason: "no_brandfetch_assets" });
    return;
  }

  const logo = brandAssets.find((asset) => asset.type === "logo");
  const colors = brandAssets.filter((asset) => asset.type === "color");
  const fonts = brandAssets.filter((asset) => asset.type === "font");
  const images = brandAssets.filter((asset) => asset.type === "image" && asset.url);
  const description = brandAssets.find(
    (asset) => asset.type === "note" && asset.title === "Company description"
  );

  const items: CanvasInsert[] = [];
  let z = 1;

  items.push({
    board_id: boardId,
    asset_id: null,
    node_type: "section",
    x: 40,
    y: 40,
    width: 560,
    height: 420,
    rotation: 0,
    z_index: z++,
    notes: null,
    data: { title: "Brand Identity" },
  });

  if (logo?.url) {
    items.push({
      board_id: boardId,
      asset_id: logo.id,
      node_type: "image",
      x: 70,
      y: 90,
      width: 160,
      height: 160,
      rotation: 0,
      z_index: z++,
      notes: null,
      data: { label: logo.title ?? "Logo", source: "brandfetch" },
    });
  }

  const colorStartX = logo ? 260 : 70;
  colors.slice(0, 5).forEach((color, index) => {
    const hex =
      readMetadataString(color.metadata_json, "hex") ??
      readMetadataString(color.metadata_json, "name") ??
      "#888888";
    items.push({
      board_id: boardId,
      asset_id: color.id,
      node_type: "color",
      x: colorStartX + index * 96,
      y: 90,
      width: 88,
      height: 118,
      rotation: 0,
      z_index: z++,
      notes: null,
      data: {
        hex: hex.startsWith("#") ? hex : `#${hex}`,
        name: color.title ?? "Brand color",
        source: "brandfetch",
      },
    });
  });

  fonts.slice(0, 2).forEach((font, index) => {
    const family =
      readMetadataString(font.metadata_json, "family") ?? font.title ?? "Brand";
    items.push({
      board_id: boardId,
      asset_id: font.id,
      node_type: "text",
      x: 70,
      y: 240 + index * 150,
      width: 360,
      height: 130,
      rotation: 0,
      z_index: z++,
      notes: null,
      data: {
        family,
        sample: family,
        role: readMetadataString(font.metadata_json, "role") ?? "Brand",
        source: "brandfetch",
      },
    });
  });

  if (description) {
    const desc =
      readMetadataString(description.metadata_json, "description") ??
      "Brand description from Brandfetch.";
    items.push({
      board_id: boardId,
      asset_id: description.id,
      node_type: "note",
      x: 70,
      y: 520,
      width: 300,
      height: 140,
      rotation: -1,
      z_index: z++,
      notes: desc,
      data: { source: "brandfetch" },
    });
  }

  if (images.length > 0) {
    items.push({
      board_id: boardId,
      asset_id: null,
      node_type: "section",
      x: 640,
      y: 40,
      width: 520,
      height: Math.max(280, 120 + Math.ceil(images.length / 2) * 170),
      rotation: 0,
      z_index: z++,
      notes: null,
      data: { title: "Visual References" },
    });

    images.slice(0, 6).forEach((image, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      items.push({
        board_id: boardId,
        asset_id: image.id,
        node_type: "image",
        x: 670 + col * 230,
        y: 100 + row * 170,
        width: 210,
        height: 150,
        rotation: index % 2 === 0 ? -1 : 1,
        z_index: z++,
        notes: null,
        data: {
          label:
            readMetadataString(image.metadata_json, "label") ??
            image.title ??
            "Brand image",
          source: "brandfetch",
          url: image.url,
        },
      });
    });
  }

  const { error: insertError } = await admin.from("canvas_items").insert(items);
  if (insertError) {
    throw new Error(`Failed to populate canvas: ${insertError.message}`);
  }

  timer.end({
    boardId,
    itemCount: items.length,
    images: images.length,
    colors: colors.length,
    fonts: fonts.length,
  });
  logPipeline(projectId, "Canvas populated from Brandfetch assets", {
    boardId,
    itemCount: items.length,
  });
}

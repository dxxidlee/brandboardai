import { z } from "zod";

const mediaFormatSchema = z.object({
  src: z.string().min(1),
  format: z.string().optional(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  background: z.string().nullish(),
  size: z.number().nullish(),
});

const logoSchema = z.object({
  type: z.string().optional(),
  theme: z.string().nullish(),
  formats: z.array(mediaFormatSchema).default([]),
});

const imageSchema = z.object({
  type: z.string().optional(),
  formats: z.array(mediaFormatSchema).default([]),
});

const colorSchema = z.object({
  hex: z.string().min(1),
  type: z.string().optional(),
  brightness: z.number().nullish(),
});

const fontSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  origin: z.string().nullish(),
  weights: z.array(z.number()).optional(),
});

export const brandfetchBrandSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    domain: z.string().optional(),
    description: z.string().optional(),
    longDescription: z.string().optional(),
    logos: z.array(logoSchema).optional(),
    images: z.array(imageSchema).optional(),
    colors: z.array(colorSchema).optional(),
    fonts: z.array(fontSchema).optional(),
  })
  .passthrough();

export type BrandfetchBrandResponse = z.infer<typeof brandfetchBrandSchema>;

export const brandfetchSearchResultSchema = z.object({
  name: z.string().nullish(),
  domain: z.string(),
  icon: z.string().nullish(),
  claimed: z.boolean().optional(),
  brandId: z.string().optional(),
});

export const brandfetchSearchResponseSchema = z.array(
  brandfetchSearchResultSchema
);

export type BrandfetchSearchResult = z.infer<typeof brandfetchSearchResultSchema>;

export type BrandfetchBrandImage = {
  url: string;
  label: string;
  type: string;
};

/** Normalized brand profile used by the audit pipeline. */
export type BrandfetchProfile = {
  name: string;
  domain: string;
  websiteUrl: string;
  description: string | null;
  logoUrl: string | null;
  colors: Array<{ hex: string; name: string; role: string }>;
  fonts: Array<{ family: string; role: string; source: string }>;
  images: BrandfetchBrandImage[];
};

export function formatBrandfetchValidationIssues(
  issues: z.ZodIssue[]
): string {
  return issues
    .slice(0, 8)
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  BRANDFETCH_API_KEY: z.string().optional(),
  BRANDFETCH_CLIENT_ID: z.string().optional(),
});

export type ServerEnv = {
  supabaseServiceRoleKey: string;
  brandfetchApiKey?: string;
  brandfetchClientId?: string;
};

export type BrandfetchConfig = {
  apiKey: string;
  clientId?: string;
};

let cached: ServerEnv | null = null;

function parseServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BRANDFETCH_API_KEY: process.env.BRANDFETCH_API_KEY,
    BRANDFETCH_CLIENT_ID: process.env.BRANDFETCH_CLIENT_ID,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid server environment variables:\n${details}\n\n` +
        "Set required keys in .env.local (never expose server-only keys to the browser)."
    );
  }

  return {
    supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    brandfetchApiKey: parsed.data.BRANDFETCH_API_KEY?.trim() || undefined,
    brandfetchClientId: parsed.data.BRANDFETCH_CLIENT_ID?.trim() || undefined,
  };
}

/** When true, audits use a synchronous mock pipeline (local dev). */
export function isAuditDebugFast(): boolean {
  return process.env.AUDIT_DEBUG_FAST === "true";
}

/**
 * Validated server-only env. Must not be imported from Client Components.
 * The `server-only` package enforces this at build time.
 */
export function getServerEnv(): ServerEnv {
  if (!cached) {
    cached = parseServerEnv();
  }
  return cached;
}

/** Validated Brandfetch credentials (server-only). */
export function getBrandfetchConfig(): BrandfetchConfig {
  const { brandfetchApiKey, brandfetchClientId } = getServerEnv();
  if (!brandfetchApiKey) {
    throw new Error(
      "BRANDFETCH_API_KEY is not set. Add it to .env.local or enable AUDIT_DEBUG_FAST=true for mock audits."
    );
  }
  return {
    apiKey: brandfetchApiKey,
    clientId: brandfetchClientId,
  };
}

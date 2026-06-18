import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

export type PublicEnv = {
  /** Project URL, e.g. https://xyz.supabase.co (not /rest/v1). */
  supabaseUrl: string;
  supabaseAnonKey: string;
};

let cached: PublicEnv | null = null;

/** Strip trailing slashes and accidental REST API suffixes. */
export function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/rest\/v1$/i, "");
}

function parsePublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid public environment variables:\n${details}\n\n` +
        "Copy .env.local.example to .env.local and set your Supabase project URL and anon key."
    );
  }

  const supabaseUrl = normalizeSupabaseUrl(parsed.data.NEXT_PUBLIC_SUPABASE_URL);

  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.endsWith(".supabase.co")) {
      throw new Error("hostname must end with .supabase.co");
    }
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL ` +
        `(e.g. https://your-project.supabase.co), got: ${supabaseUrl}`
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/** Validated public env — safe to import from client and server code. */
export function getPublicEnv(): PublicEnv {
  if (!cached) {
    cached = parsePublicEnv();
  }
  return cached;
}

import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env/public";
import { getServerEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client — bypasses RLS.
 * Server-only: never import from Client Components or shared client bundles.
 */
export function createAdminClient() {
  const { supabaseUrl } = getPublicEnv();
  const { supabaseServiceRoleKey } = getServerEnv();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

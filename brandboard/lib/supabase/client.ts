"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database.types";

/** Browser Supabase client (anon key, RLS enforced). */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

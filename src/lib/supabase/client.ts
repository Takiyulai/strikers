"use client";

import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

/** Client navigateur, utilisé dans les composants `"use client"`. */
export function createBrowserClient() {
  return createSsrBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
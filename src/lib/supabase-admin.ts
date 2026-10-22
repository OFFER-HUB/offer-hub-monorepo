import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client for flows that must not be reachable with the public
 * anon key (data-rights tokens and the records they unlock). Returns null
 * when the service role key is missing so callers can answer 503.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !key || url.includes("your_") || key.includes("your_")) {
    return null;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

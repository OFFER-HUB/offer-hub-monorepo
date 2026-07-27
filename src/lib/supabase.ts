import { createClient } from "@supabase/supabase-js";

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const looksLikePlaceholder =
  !rawUrl ||
  rawUrl.includes("your_") ||
  rawUrl.includes("placeholder") ||
  !isValidHttpUrl(rawUrl);

const supabaseUrl = looksLikePlaceholder ? "" : rawUrl;
const supabaseAnonKey =
  !rawKey || rawKey.includes("your_") || rawKey.includes("placeholder")
    ? ""
    : rawKey;

// Check if Supabase is properly configured (not using placeholders)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder") &&
  supabaseUrl.includes("supabase")
);

/**
 * IMPORTANT:
 * Don’t instantiate a Supabase client with placeholder envs at module load.
 * In dev, placeholder values can cause runtime errors that break rendering and
 * make pages appear “unstyled” due to full reloads / 500s.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;



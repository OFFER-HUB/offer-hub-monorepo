/**
 * Supabase table row types. Inferred from actual query/insert call sites
 * across src/services/*.ts and src/lib/supabase.ts — no SQL migration files
 * exist in this repo to check against directly. Treat as a floor, not a
 * guaranteed-complete schema: columns the app never reads back (e.g. DB-side
 * defaults, audit columns) won't appear here. Verify against the real
 * Supabase schema before relying on this for anything beyond what's already
 * used in the app.
 */

export interface WaitlistRow {
  id: string;
  email: string;
  name: string | null;
  /** Present in src/lib/supabase.ts's older WaitlistEntry type; not written
   * by the current insert path in services/waitlist.ts. Kept optional in
   * case older rows have it. */
  company?: string | null;
  purpose: string | null;
  referral: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ContactInquiryRow {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface PageViewRow {
  id: string;
  visitor_id: string;
  page_path: string;
  page_title: string;
  referrer: string | null;
  session_id: string;
  user_agent: string;
  browser: string | null;
  device: string | null;
  os: string | null;
  screen_width: number | null;
  screen_height: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}
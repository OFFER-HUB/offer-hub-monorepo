import { supabase } from "@/lib/supabase";

export interface WaitlistSubmission {
  email: string;
  name: string;
  purpose: string;
  referral: string;
}

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "duplicate" | "error" | "network" };

const UNIQUE_VIOLATION = "23505";

export async function submitWaitlistEntry(
  entry: WaitlistSubmission,
): Promise<WaitlistResult> {
  if (!supabase) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const { error } = await supabase.from("waitlist").insert([
      {
        email: entry.email,
        name: entry.name,
        purpose: entry.purpose,
        referral: entry.referral,
      },
    ]);

    if (error) {
      return {
        ok: false,
        reason: error.code === UNIQUE_VIOLATION ? "duplicate" : "error",
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

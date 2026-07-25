import { supabase } from "@/lib/supabase";

export interface ContactSubmission {
  company: string;
  name: string;
  email: string;
  message: string;
}

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "error" | "network" };

export async function submitContactInquiry(
  inquiry: ContactSubmission,
): Promise<ContactResult> {
  if (!supabase) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const { error } = await supabase.from("contact_inquiries").insert([
      {
        company: inquiry.company,
        contact_name: inquiry.name,
        email: inquiry.email,
        message: inquiry.message,
      },
    ]);

    if (error) {
      return { ok: false, reason: "error" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

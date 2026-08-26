export type ContactSubmission = {
  company: string;
  name: string;
  email: string;
  message: string;
};

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "error" | "network" | "validation"; errors?: Record<string, string> };

export async function submitContactInquiry(
  inquiry: ContactSubmission,
): Promise<ContactResult> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiry),
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 400 && json.errors) {
      return { ok: false, reason: "validation", errors: json.errors };
    }

    if (res.status === 503) {
      return { ok: false, reason: "not_configured" };
    }

    if (!res.ok) {
      return { ok: false, reason: "error" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

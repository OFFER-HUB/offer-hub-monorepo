export type WaitlistSubmission = {
  email: string;
  name: string;
  purpose: string;
  referral: string;
};

export type WaitlistResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_configured" | "duplicate" | "error" | "network" | "validation";
      errors?: Record<string, string>;
    };

export async function submitWaitlistEntry(
  entry: WaitlistSubmission,
): Promise<WaitlistResult> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 400 && json.errors) {
      return { ok: false, reason: "validation", errors: json.errors };
    }

    if (res.status === 503) {
      return { ok: false, reason: "not_configured" };
    }

    if (res.status === 409 && json.error === "duplicate") {
      return { ok: false, reason: "duplicate" };
    }

    if (!res.ok) {
      return { ok: false, reason: "error" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

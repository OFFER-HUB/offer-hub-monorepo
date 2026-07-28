export type DataRightsResult =
  | { ok: true; message: string }
  | { ok: false; reason: "error" | "network"; message: string }

export async function submitDataRightsRequest(
  endpoint: string,
  email: string
): Promise<DataRightsResult> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const json = await res.json()

    if (!res.ok) {
      return {
        ok: false,
        reason: "error",
        message: json.error ?? "An error occurred.",
      }
    }

    return {
      ok: true,
      message: json.message ?? "Done.",
    }
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "Network error. Please try again.",
    }
  }
}

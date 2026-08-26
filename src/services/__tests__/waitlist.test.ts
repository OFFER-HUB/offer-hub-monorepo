import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitWaitlistEntry, type WaitlistSubmission } from "../waitlist";

const ENTRY: WaitlistSubmission = {
  email: "jane@acme.com",
  name: "Jane Doe",
  purpose: "Marketplace payouts",
  referral: "Twitter",
};

function mockFetch(impl: () => Promise<unknown>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe("submitWaitlistEntry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs the entry as JSON to /api/waitlist", async () => {
    const fetchMock = mockFetch(async () => jsonResponse(200, { ok: true }));

    await submitWaitlistEntry(ENTRY);

    expect(fetchMock).toHaveBeenCalledWith("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ENTRY),
    });
  });

  it("returns ok on success", async () => {
    mockFetch(async () => jsonResponse(200, { ok: true }));

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({ ok: true });
  });

  it("maps 400 field errors to validation", async () => {
    mockFetch(async () =>
      jsonResponse(400, { errors: { email: "Enter a valid work email" } }),
    );

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "validation",
      errors: { email: "Enter a valid work email" },
    });
  });

  it("maps 503 to not_configured", async () => {
    mockFetch(async () => jsonResponse(503, { error: "unavailable" }));

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
  });

  it("maps 409 duplicate to duplicate", async () => {
    mockFetch(async () => jsonResponse(409, { error: "duplicate" }));

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "duplicate",
    });
  });

  it("maps other non-2xx responses to error", async () => {
    mockFetch(async () => jsonResponse(500, { error: "boom" }));

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "error",
    });
  });

  it("maps a thrown request to network", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "network",
    });
  });
});

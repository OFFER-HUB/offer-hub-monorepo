import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitContactInquiry, type ContactSubmission } from "../contact";

const INQUIRY: ContactSubmission = {
  company: "Acme Inc",
  name: "Jane Doe",
  email: "jane@acme.com",
  message: "We'd like to discuss enterprise pricing.",
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

describe("submitContactInquiry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs the inquiry as JSON to /api/contact", async () => {
    const fetchMock = mockFetch(async () => jsonResponse(200, { ok: true }));

    await submitContactInquiry(INQUIRY);

    expect(fetchMock).toHaveBeenCalledWith("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(INQUIRY),
    });
  });

  it("returns ok on success", async () => {
    mockFetch(async () => jsonResponse(200, { ok: true }));

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({ ok: true });
  });

  it("maps 400 field errors to validation", async () => {
    mockFetch(async () =>
      jsonResponse(400, { errors: { email: "Enter a valid work email" } }),
    );

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "validation",
      errors: { email: "Enter a valid work email" },
    });
  });

  it("maps 503 to not_configured", async () => {
    mockFetch(async () => jsonResponse(503, { error: "unavailable" }));

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
  });

  it("maps other non-2xx responses to error", async () => {
    mockFetch(async () => jsonResponse(500, { error: "boom" }));

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "error",
    });
  });

  it("maps a thrown request to network", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "network",
    });
  });
});

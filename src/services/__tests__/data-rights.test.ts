import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitDataRightsRequest } from "../data-rights";

const ENDPOINT = "/api/privacy/export";

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

describe("submitDataRightsRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs the email as JSON to the given endpoint", async () => {
    const fetchMock = mockFetch(async () =>
      jsonResponse(200, { message: "Exported." }),
    );

    await submitDataRightsRequest(ENDPOINT, "jane@acme.com");

    expect(fetchMock).toHaveBeenCalledWith(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jane@acme.com" }),
    });
  });

  it("returns the server message on success", async () => {
    mockFetch(async () => jsonResponse(200, { message: "Exported." }));

    await expect(
      submitDataRightsRequest(ENDPOINT, "jane@acme.com"),
    ).resolves.toEqual({ ok: true, message: "Exported." });
  });

  it("falls back to a generic success message when the body has none", async () => {
    mockFetch(async () => jsonResponse(200, {}));

    await expect(
      submitDataRightsRequest(ENDPOINT, "jane@acme.com"),
    ).resolves.toEqual({ ok: true, message: "Done." });
  });

  it("surfaces the server error message on a non-2xx response", async () => {
    mockFetch(async () =>
      jsonResponse(404, { error: "No record found for that email address." }),
    );

    await expect(
      submitDataRightsRequest(ENDPOINT, "ghost@acme.com"),
    ).resolves.toEqual({
      ok: false,
      reason: "error",
      message: "No record found for that email address.",
    });
  });

  it("maps 400 field errors to validation", async () => {
    mockFetch(async () =>
      jsonResponse(400, {
        errors: { email: "A valid email address is required." },
      }),
    );

    await expect(
      submitDataRightsRequest(ENDPOINT, "a@@b.co"),
    ).resolves.toEqual({
      ok: false,
      reason: "validation",
      message: "A valid email address is required.",
      errors: { email: "A valid email address is required." },
    });
  });

  it("falls back to a generic error message when the error body has none", async () => {
    mockFetch(async () => jsonResponse(500, {}));

    await expect(
      submitDataRightsRequest(ENDPOINT, "jane@acme.com"),
    ).resolves.toEqual({
      ok: false,
      reason: "error",
      message: "An error occurred.",
    });
  });

  it("returns a network result when fetch rejects", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(
      submitDataRightsRequest(ENDPOINT, "jane@acme.com"),
    ).resolves.toEqual({
      ok: false,
      reason: "network",
      message: "Network error. Please try again.",
    });
  });

  it("returns a network result when the response body is not valid JSON", async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    }));

    await expect(
      submitDataRightsRequest(ENDPOINT, "jane@acme.com"),
    ).resolves.toEqual({
      ok: false,
      reason: "network",
      message: "Network error. Please try again.",
    });
  });
});

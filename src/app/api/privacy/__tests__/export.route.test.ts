// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({
  configured: true,
  supabase: null as unknown,
}));

vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return state.supabase;
  },
  get isSupabaseConfigured() {
    return state.configured;
  },
}));

import { POST } from "../export/route";

/** `.select("*").eq("email", x).maybeSingle<WaitlistRow>()` */
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

const ROW = {
  id: "row-1",
  email: "jane@acme.com",
  name: "Jane Doe",
  purpose: "Marketplace payouts",
  referral: "Twitter",
  created_at: "2026-04-01T10:00:00Z",
};

function request(body: unknown, raw = false) {
  return new NextRequest("https://offer-hub.tech/api/privacy/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  maybeSingle.mockResolvedValue({ data: ROW, error: null });
  state.configured = true;
  state.supabase = { from };
});

describe("POST /api/privacy/export - input validation", () => {
  it.each([
    ["a missing body key", {}],
    ["an empty email", { email: "" }],
    ["a whitespace-only email", { email: "   " }],
    ["a null email", { email: null }],
    ["an address with no @", { email: "not-an-email" }],
    ["an address with no domain dot", { email: "jane@acme" }],
    ["an address with no local part", { email: "@acme.com" }],
    ["an address containing a space", { email: "jane doe@acme.com" }],
  ])("rejects %s with 400", async (_label, body) => {
    const res = await POST(request(body));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "A valid email address is required.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects a body that is not valid JSON with 400 rather than throwing", async () => {
    const res = await POST(request("not json at all", true));

    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("trims the email before looking it up", async () => {
    await POST(request({ email: "  jane@acme.com  " }));

    expect(eq).toHaveBeenCalledWith("email", "jane@acme.com");
  });
});

describe("POST /api/privacy/export - service availability", () => {
  it("returns 503 when Supabase is not configured", async () => {
    state.configured = false;

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "Service temporarily unavailable.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 503 when the client is null even though the flag is true", async () => {
    state.supabase = null;

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(503);
  });
});

describe("POST /api/privacy/export - retrieval", () => {
  it("returns the full waitlist row under a data key", async () => {
    const res = await POST(request({ email: "jane@acme.com" }));

    expect(from).toHaveBeenCalledWith("waitlist");
    expect(select).toHaveBeenCalledWith("*");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: ROW });
  });

  it("returns 404 when no row matches the address", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const res = await POST(request({ email: "ghost@acme.com" }));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: "No record found for that email address.",
    });
  });

  it("returns 500 when the query itself fails", async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Failed to retrieve data.",
    });
  });

  it("prefers the 500 error path over the 404 when both would apply", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(500);
  });

  it("does not leak the raw Supabase error message to the caller", async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { message: "relation waitlist does not exist" },
    });

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(JSON.stringify(await res.json())).not.toContain("relation waitlist");
  });
});

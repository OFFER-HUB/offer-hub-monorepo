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

import { POST } from "../delete/route";

/** `.select("id").eq("email", x).maybeSingle()` */
const maybeSingle = vi.fn();
const selectEq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: selectEq }));

/** `.delete().eq("email", x)` — awaited directly */
const deleteEq = vi.fn();
const del = vi.fn(() => ({ eq: deleteEq }));

const from = vi.fn(() => ({ select, delete: del }));

function request(body: unknown, raw = false) {
  return new NextRequest("https://offer-hub.tech/api/privacy/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  maybeSingle.mockResolvedValue({ data: { id: "row-1" } });
  deleteEq.mockResolvedValue({ error: null });
  state.configured = true;
  state.supabase = { from };
});

describe("POST /api/privacy/delete — input validation", () => {
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
    const res = await POST(request("<html>oops</html>", true));

    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("trims the email before looking it up", async () => {
    await POST(request({ email: "  jane@acme.com  " }));

    expect(selectEq).toHaveBeenCalledWith("email", "jane@acme.com");
  });
});

describe("POST /api/privacy/delete — service availability", () => {
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

describe("POST /api/privacy/delete — lookup and deletion", () => {
  it("returns 404 without deleting when no waitlist row matches", async () => {
    maybeSingle.mockResolvedValue({ data: null });

    const res = await POST(request({ email: "ghost@acme.com" }));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: "No record found for that email address.",
    });
    expect(del).not.toHaveBeenCalled();
  });

  it("deletes the matching row and confirms with the GDPR Article 17 message", async () => {
    const res = await POST(request({ email: "jane@acme.com" }));

    expect(from).toHaveBeenCalledWith("waitlist");
    expect(select).toHaveBeenCalledWith("id");
    expect(del).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("email", "jane@acme.com");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/successfully deleted/i);
    expect(body.message).toMatch(/GDPR Article 17/);
  });

  it("returns 500 when the delete fails", async () => {
    deleteEq.mockResolvedValue({ error: { message: "permission denied" } });

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Failed to process deletion request.",
    });
  });

  it("does not echo the caller's email back in the response body", async () => {
    const res = await POST(request({ email: "jane@acme.com" }));

    expect(JSON.stringify(await res.json())).not.toContain("jane@acme.com");
  });
});

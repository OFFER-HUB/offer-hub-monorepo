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

import { POST } from "../route";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));

function request(body: unknown, raw = false) {
  return new NextRequest("https://offer-hub.tech/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

const VALID = {
  name: "Jane Doe",
  email: "jane@acme.com",
  purpose: "Marketplace payouts",
  referral: "Twitter",
};

beforeEach(() => {
  vi.clearAllMocks();
  insert.mockResolvedValue({ error: null });
  state.configured = true;
  state.supabase = { from };
});

describe("POST /api/waitlist — input validation", () => {
  it.each([
    ["a missing body key", { email: "jane@acme.com" }],
    ["an invalid email", { ...VALID, email: "a@@b.co" }],
    ["a multi-@ email", { ...VALID, email: "a@b@c.co" }],
  ])("rejects %s with 400 field errors", async (_label, body) => {
    const res = await POST(request(body));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    const res = await POST(request("<html>", true));

    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });
});

describe("POST /api/waitlist — persistence", () => {
  it("inserts a valid entry and returns ok", async () => {
    const res = await POST(request(VALID));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("waitlist");
    expect(insert).toHaveBeenCalledWith([VALID]);
  });

  it("returns 503 when Supabase is not configured", async () => {
    state.configured = false;

    const res = await POST(request(VALID));

    expect(res.status).toBe(503);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 409 on duplicate email", async () => {
    insert.mockResolvedValue({ error: { code: "23505" } });

    const res = await POST(request(VALID));

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ error: "duplicate" });
  });

  it("returns 500 when insert fails", async () => {
    insert.mockResolvedValue({ error: { code: "42501" } });

    const res = await POST(request(VALID));

    expect(res.status).toBe(500);
  });
});

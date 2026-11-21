// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ admin: null as unknown }));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => state.admin,
}));

import { POST } from "../confirm/route";
import { hashDataRightsToken } from "@/lib/data-rights-tokens";

const TOKEN = "a".repeat(64);
const ROW = { id: "row-1", email: "jane@acme.com", name: "Jane Doe" };

/** tokens: `.update().eq().is().gt().select().maybeSingle()` */
const consume = vi.fn();
const tokenChain = {
  eq: vi.fn(() => tokenChain),
  is: vi.fn(() => tokenChain),
  gt: vi.fn(() => tokenChain),
  select: vi.fn(() => ({ maybeSingle: consume })),
};
const update = vi.fn(() => tokenChain);

/** waitlist: `.select("*").eq().maybeSingle()` and `.delete().eq()` */
const rowLookup = vi.fn();
const deleteEq = vi.fn();
const waitlist = {
  select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: rowLookup })) })),
  delete: vi.fn(() => ({ eq: deleteEq })),
};

const from = vi.fn((table: string) =>
  table === "waitlist" ? waitlist : { update },
);

function request(body: unknown, raw = false) {
  return new NextRequest("https://offer-hub.tech/api/privacy/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  consume.mockResolvedValue({
    data: { email: "jane@acme.com", action: "export" },
    error: null,
  });
  rowLookup.mockResolvedValue({ data: ROW, error: null });
  deleteEq.mockResolvedValue({ error: null });
  state.admin = { from };
});

describe("POST /api/privacy/confirm - token handling", () => {
  it.each([
    ["a missing token", {}],
    ["a non-string token", { token: 12 }],
    ["a tampered token (wrong length)", { token: TOKEN.slice(1) }],
    ["a tampered token (non-hex)", { token: "z".repeat(64) }],
  ])("rejects %s with 400 without touching the database", async (_l, body) => {
    const res = await POST(request(body));

    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    const res = await POST(request("nope", true));

    expect(res.status).toBe(400);
  });

  it("looks the token up by its hash, never the raw value", async () => {
    await POST(request({ token: TOKEN }));

    expect(tokenChain.eq).toHaveBeenCalledWith(
      "token_hash",
      hashDataRightsToken(TOKEN),
    );
    expect(tokenChain.is).toHaveBeenCalledWith("used_at", null);
    expect(tokenChain.gt).toHaveBeenCalledWith(
      "expires_at",
      expect.any(String),
    );
  });

  it.each([
    ["an expired token", "expired"],
    ["a reused token", "used"],
    ["an unknown or well-formed but forged token", "unknown"],
  ])("returns 400 for %s and exposes no data", async () => {
    consume.mockResolvedValue({ data: null, error: null });

    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "This confirmation link is invalid or has expired.",
    });
    expect(waitlist.select).not.toHaveBeenCalled();
    expect(waitlist.delete).not.toHaveBeenCalled();
  });

  it("returns 500 when consuming the token fails", async () => {
    consume.mockResolvedValue({ data: null, error: { message: "boom" } });

    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(500);
  });

  it("returns 503 when the service role client is not configured", async () => {
    state.admin = null;

    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(503);
  });
});

describe("POST /api/privacy/confirm - export", () => {
  it("returns the record for a valid export token", async () => {
    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ action: "export", data: ROW });
    expect(waitlist.delete).not.toHaveBeenCalled();
  });

  it("returns 404 when the record is gone", async () => {
    rowLookup.mockResolvedValue({ data: null, error: null });

    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(404);
  });

  it("returns 500 without leaking the database message", async () => {
    rowLookup.mockResolvedValue({
      data: null,
      error: { message: "relation waitlist does not exist" },
    });

    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("relation");
  });
});

describe("POST /api/privacy/confirm - delete", () => {
  beforeEach(() => {
    consume.mockResolvedValue({
      data: { email: "jane@acme.com", action: "delete" },
      error: null,
    });
  });

  it("deletes the record only for a valid delete token", async () => {
    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(200);
    expect(deleteEq).toHaveBeenCalledWith("email", "jane@acme.com");
    await expect(res.json()).resolves.toMatchObject({ action: "delete" });
    expect(waitlist.select).not.toHaveBeenCalled();
  });

  it("returns 500 when the delete fails", async () => {
    deleteEq.mockResolvedValue({ error: { message: "boom" } });

    const res = await POST(request({ token: TOKEN }));

    expect(res.status).toBe(500);
  });
});

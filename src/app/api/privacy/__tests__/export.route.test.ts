// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({
  admin: null as unknown,
  mailer: true,
}));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => state.admin,
}));

const sendMail = vi.hoisted(() => vi.fn());

vi.mock("@/lib/mailer", () => ({
  isMailerConfigured: () => state.mailer,
  sendMail,
}));

import { POST } from "../export/route";
import { DATA_RIGHTS_REQUEST_MESSAGE } from "@/lib/data-rights-request";
import { hashDataRightsToken } from "@/lib/data-rights-tokens";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const insert = vi.fn();
const from = vi.fn((table: string) =>
  table === "waitlist" ? { select } : { insert },
);

function request(body: unknown, raw = false) {
  return new NextRequest("https://offer-hub.tech/api/privacy/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  maybeSingle.mockResolvedValue({ data: { id: "row-1" }, error: null });
  insert.mockResolvedValue({ error: null });
  sendMail.mockResolvedValue(true);
  state.mailer = true;
  state.admin = { from };
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
      errors: { email: "A valid email address is required." },
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
  it("returns 503 when the service role client is not configured", async () => {
    state.admin = null;

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "Service temporarily unavailable.",
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("returns 503 when the mailer is not configured", async () => {
    state.mailer = false;

    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(503);
    expect(from).not.toHaveBeenCalled();
  });
});

describe("POST /api/privacy/export - verification step", () => {
  it("emails a confirmation link and stores only the token hash", async () => {
    const res = await POST(request({ email: "jane@acme.com" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: DATA_RIGHTS_REQUEST_MESSAGE,
    });

    const mail = sendMail.mock.calls[0][0];
    const token = /token=([a-f0-9]{64})/.exec(mail.text)?.[1] as string;
    expect(mail.to).toBe("jane@acme.com");
    expect(token).toBeDefined();

    const [row] = insert.mock.calls[0][0];
    expect(row.token_hash).toBe(hashDataRightsToken(token));
    expect(JSON.stringify(row)).not.toContain(token);
    expect(row.action).toBe("export");
    expect(row.email).toBe("jane@acme.com");
    expect(new Date(row.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("never returns the record or acts on it from the request alone", async () => {
    const res = await POST(request({ email: "jane@acme.com" }));

    expect(JSON.stringify(await res.json())).not.toContain("row-1");
    expect(select).toHaveBeenCalledWith("id");
  });

  it("returns the same response for an unknown email and sends nothing", async () => {
    const known = await POST(request({ email: "jane@acme.com" }));
    const knownBody = await known.json();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    sendMail.mockClear();
    insert.mockClear();

    const unknown = await POST(request({ email: "ghost@acme.com" }));

    expect(unknown.status).toBe(known.status);
    await expect(unknown.json()).resolves.toEqual(knownBody);
    expect(sendMail).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("keeps the generic response when the lookup, insert or mail fails", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const lookup = await POST(request({ email: "jane@acme.com" }));

    insert.mockResolvedValueOnce({ error: { message: "boom" } });
    const stored = await POST(request({ email: "jane@acme.com" }));

    sendMail.mockResolvedValueOnce(false);
    const mailed = await POST(request({ email: "jane@acme.com" }));

    for (const res of [lookup, stored, mailed]) {
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        message: DATA_RIGHTS_REQUEST_MESSAGE,
      });
    }
  });
});

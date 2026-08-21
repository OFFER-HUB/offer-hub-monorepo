import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * `waitlist.ts` reads `supabase` at call time, so a getter-backed mock lets
 * each test swap the client (or drop it to `null` for the
 * "Supabase not configured" path) without re-importing the module.
 */
const state = vi.hoisted(() => ({
  supabase: null as { from: (table: string) => { insert: unknown } } | null,
}));

vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return state.supabase;
  },
  get isSupabaseConfigured() {
    return state.supabase !== null;
  },
}));

import { submitWaitlistEntry, type WaitlistSubmission } from "../waitlist";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));

const ENTRY: WaitlistSubmission = {
  email: "jane@acme.com",
  name: "Jane Doe",
  purpose: "Marketplace payouts",
  referral: "Twitter",
};

describe("submitWaitlistEntry", () => {
  beforeEach(() => {
    insert.mockReset();
    from.mockClear();
    state.supabase = { from } as unknown as typeof state.supabase;
  });

  it("returns not_configured without touching the network when Supabase is null", async () => {
    state.supabase = null;

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
    expect(from).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("inserts the entry into the waitlist table and reports success", async () => {
    insert.mockResolvedValueOnce({ error: null });

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({ ok: true });

    expect(from).toHaveBeenCalledWith("waitlist");
    expect(insert).toHaveBeenCalledWith([
      {
        email: "jane@acme.com",
        name: "Jane Doe",
        purpose: "Marketplace payouts",
        referral: "Twitter",
      },
    ]);
  });

  it("sends only the four declared columns (no extra fields leak through)", async () => {
    insert.mockResolvedValueOnce({ error: null });

    await submitWaitlistEntry({
      ...ENTRY,
      // Simulates a caller passing a wider object than the interface allows.
      ...({ isAdmin: true } as unknown as WaitlistSubmission),
    });

    const [[rows]] = insert.mock.calls as [[Record<string, unknown>[]]];
    expect(Object.keys(rows[0]).sort()).toEqual([
      "email",
      "name",
      "purpose",
      "referral",
    ]);
  });

  it("maps the unique-violation code 23505 to duplicate", async () => {
    insert.mockResolvedValueOnce({ error: { code: "23505" } });

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "duplicate",
    });
  });

  it("maps any other Postgres error to error", async () => {
    insert.mockResolvedValueOnce({ error: { code: "42501" } });

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "error",
    });
  });

  it("maps an error without a code to error", async () => {
    insert.mockResolvedValueOnce({ error: { message: "boom" } });

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "error",
    });
  });

  it("maps a thrown request (network failure) to network", async () => {
    insert.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(submitWaitlistEntry(ENTRY)).resolves.toEqual({
      ok: false,
      reason: "network",
    });
  });
});

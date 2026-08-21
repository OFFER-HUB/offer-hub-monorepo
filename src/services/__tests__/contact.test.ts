import { describe, it, expect, vi, beforeEach } from "vitest";

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

import { submitContactInquiry, type ContactSubmission } from "../contact";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));

const INQUIRY: ContactSubmission = {
  company: "Acme Inc",
  name: "Jane Doe",
  email: "jane@acme.com",
  message: "We'd like to discuss enterprise pricing.",
};

describe("submitContactInquiry", () => {
  beforeEach(() => {
    insert.mockReset();
    from.mockClear();
    state.supabase = { from } as unknown as typeof state.supabase;
  });

  it("returns not_configured without touching the network when Supabase is null", async () => {
    state.supabase = null;

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
    expect(from).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("inserts into contact_inquiries, mapping name to contact_name", async () => {
    insert.mockResolvedValueOnce({ error: null });

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({ ok: true });

    expect(from).toHaveBeenCalledWith("contact_inquiries");
    expect(insert).toHaveBeenCalledWith([
      {
        company: "Acme Inc",
        contact_name: "Jane Doe",
        email: "jane@acme.com",
        message: "We'd like to discuss enterprise pricing.",
      },
    ]);
  });

  it("sends only the four declared columns", async () => {
    insert.mockResolvedValueOnce({ error: null });

    await submitContactInquiry({
      ...INQUIRY,
      ...({ role: "admin" } as unknown as ContactSubmission),
    });

    const [[rows]] = insert.mock.calls as [[Record<string, unknown>[]]];
    expect(Object.keys(rows[0]).sort()).toEqual([
      "company",
      "contact_name",
      "email",
      "message",
    ]);
  });

  it("forwards an empty message through rather than dropping the column", async () => {
    insert.mockResolvedValueOnce({ error: null });

    await submitContactInquiry({ ...INQUIRY, message: "" });

    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({ message: "" }),
    ]);
  });

  it("maps a Supabase error to error", async () => {
    insert.mockResolvedValueOnce({ error: { message: "permission denied" } });

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "error",
    });
  });

  it("maps a thrown request (network failure) to network", async () => {
    insert.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(submitContactInquiry(INQUIRY)).resolves.toEqual({
      ok: false,
      reason: "network",
    });
  });
});

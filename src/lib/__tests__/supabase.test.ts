import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * `supabase.ts` reads the env and builds the client at module load, so every
 * case has to re-import the module with a fresh env rather than calling a
 * function. `vi.resetModules()` + dynamic `import()` gives us that.
 */
const createClient = vi.hoisted(() =>
  vi.fn(() => ({ __brand: "supabase-client" })),
);

vi.mock("@supabase/supabase-js", () => ({ createClient }));

async function loadWithEnv(url: string, key: string) {
  vi.resetModules();
  createClient.mockClear();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);
  return import("../supabase");
}

const VALID_URL = "https://abcdefgh.supabase.co";
const VALID_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon-key";

beforeEach(() => {
  createClient.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isSupabaseConfigured - placeholder detection", () => {
  it("is true and builds a client for a real project URL and key", async () => {
    const mod = await loadWithEnv(VALID_URL, VALID_KEY);

    expect(mod.isSupabaseConfigured).toBe(true);
    expect(mod.supabase).not.toBeNull();
    expect(createClient).toHaveBeenCalledWith(VALID_URL, VALID_KEY);
  });

  it("trims surrounding whitespace off both values before using them", async () => {
    const mod = await loadWithEnv("  " + VALID_URL + "  ", "\t" + VALID_KEY + "\n");

    expect(mod.isSupabaseConfigured).toBe(true);
    expect(createClient).toHaveBeenCalledWith(VALID_URL, VALID_KEY);
  });

  it.each([
    ["both env vars missing", "", ""],
    ["only the URL set", VALID_URL, ""],
    ["only the key set", "", VALID_KEY],
    ["whitespace-only values", "   ", "   "],
  ])("is false with %s", async (_label, url, key) => {
    const mod = await loadWithEnv(url, key);

    expect(mod.isSupabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
  });

  it.each([
    ["the .env.example URL placeholder", "your_supabase_url"],
    ["a your_-prefixed project URL", "https://your_project.supabase.co"],
    ["a literal placeholder URL", "https://placeholder.supabase.co"],
  ])("is false for %s", async (_label, url) => {
    const mod = await loadWithEnv(url, VALID_KEY);

    expect(mod.isSupabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
  });

  it.each([
    ["the .env.example key placeholder", "your_supabase_anon_key"],
    ["a key containing placeholder", "placeholder-anon-key"],
  ])("is false for %s", async (_label, key) => {
    const mod = await loadWithEnv(VALID_URL, key);

    expect(mod.isSupabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
  });

  it.each([
    ["a bare hostname", "abcdefgh.supabase.co"],
    ["a non-URL string", "not-a-url"],
    ["a protocol-relative URL", "//abcdefgh.supabase.co"],
  ])("is false for %s (fails the http(s) URL check)", async (_label, url) => {
    const mod = await loadWithEnv(url, VALID_KEY);

    expect(mod.isSupabaseConfigured).toBe(false);
  });

  it.each([
    ["ftp", "ftp://abcdefgh.supabase.co"],
    ["postgres", "postgres://abcdefgh.supabase.co:5432"],
  ])("is false for the %s scheme", async (_label, url) => {
    const mod = await loadWithEnv(url, VALID_KEY);

    expect(mod.isSupabaseConfigured).toBe(false);
  });

  it("accepts a plain http URL (local Supabase during development)", async () => {
    const mod = await loadWithEnv("http://localhost:54321/supabase", VALID_KEY);

    expect(mod.isSupabaseConfigured).toBe(true);
  });

  it("is false for a valid URL that is not a Supabase host", async () => {
    const mod = await loadWithEnv("https://example.com", VALID_KEY);

    expect(mod.isSupabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
  });

  it("never constructs a client when the config is rejected", async () => {
    await loadWithEnv("your_supabase_url", "your_supabase_anon_key");

    expect(createClient).not.toHaveBeenCalled();
  });

  it("exports supabase as exactly null (not undefined) when unconfigured", async () => {
    const mod = await loadWithEnv("", "");

    expect(mod.supabase).toBeNull();
  });
});

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRateLimitIdentity, getRateLimitPolicy, consumeRateLimit, RATE_LIMIT_SCRIPT } from "../rate-limit";

const policy = { bucket: "test", limit: 2, windowMs: 1000 };
const headers = new Headers({ "x-forwarded-for": "192.0.2.1" });
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("RATE_LIMIT_IP_HEADER", "");
  vi.stubEnv("RATE_LIMIT_NAMESPACE", "test:rl");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.test");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-server-token");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async () => Response.json({ result: [1, 1000] }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getRateLimitPolicy", () => {
  it.each([
    ["/api/waitlist", "POST", "forms", 5, 10 * 60_000],
    ["/api/contact", "POST", "forms", 5, 10 * 60_000],
    ["/api/privacy", "POST", "privacy", 10, 15 * 60_000],
    ["/api/privacy/export", "POST", "privacy", 10, 15 * 60_000],
    ["/api/privacy/delete", "POST", "privacy", 10, 15 * 60_000],
    ["/api/privacy/confirm", "POST", "privacy", 10, 15 * 60_000],
    ["/api/mcp", "POST", "writes", 30, 60_000],
    ["/api/mcp", "DELETE", "writes", 30, 60_000],
    ["/api/mcp", "GET", "reads", 120, 60_000],
    ["/api/docs-raw/guide", "GET", "reads", 120, 60_000],
    ["/docs/guide/raw", "GET", "reads", 120, 60_000],
  ])("maps %s %s to %s limit %d per %dms", (path, method, bucket, limit, windowMs) => {
    expect(getRateLimitPolicy(path, method)).toEqual({ bucket, limit, windowMs });
  });
});

describe("getRateLimitIdentity", () => {
  it("uses the Vercel supplied address", () => {
    expect(getRateLimitIdentity(headers)).toBe("192.0.2.1");
  });

  it("ignores forwarding headers outside a configured trusted ingress", () => {
    vi.stubEnv("VERCEL", "");
    expect(getRateLimitIdentity(headers)).toBe("unknown");
  });

  it("uses only the configured ingress header, with canonical IPv4/IPv6", () => {
    vi.stubEnv("RATE_LIMIT_IP_HEADER", "x-client-ip");
    expect(getRateLimitIdentity(new Headers({ "x-client-ip": "192.000.002.001" }))).toBe("192.0.2.1");
    expect(getRateLimitIdentity(new Headers({ "x-client-ip": "2001:0DB8:0:0:0:0:0:1" }))).toBe("[2001:db8::1]");
    expect(getRateLimitIdentity(headers)).toBe("unknown");
  });

  it.each(["", "garbage", "999.0.0.1", "192.0.2.1, 192.0.2.2", "192.0.2.1:443", ":::1", "fe80::1%eth0"])(
    "shares the fallback bucket for missing/malformed address %j", (value) => {
      expect(getRateLimitIdentity(new Headers({ "x-forwarded-for": value }))).toBe("unknown");
    },
  );
});

describe("shared Redis store", () => {
  it("atomically consumes a slot, sends no raw IP and prevents caching", async () => {
    await expect(consumeRateLimit(headers, policy)).resolves.toEqual({ allowed: true, retryAfter: 1 });
    const [endpoint, options] = fetchMock.mock.calls[0];
    const command = JSON.parse(options.body);
    expect(endpoint).toBe("https://redis.example.test");
    expect(command).toEqual(["EVAL", RATE_LIMIT_SCRIPT, "1", expect.stringMatching(/^test:rl:test:[a-f0-9]{64}$/), "2", "1000"]);
    expect(options.body).not.toContain("192.0.2.1");
    expect(options).toMatchObject({ method: "POST", cache: "no-store", headers: { Authorization: "Bearer test-server-token" } });
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("honors allowed, limited and reset decisions from the store on every request", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ result: [1, 1000] }))
      .mockResolvedValueOnce(Response.json({ result: [1, 900] }))
      .mockResolvedValueOnce(Response.json({ result: [0, 1] }))
      .mockResolvedValueOnce(Response.json({ result: [1, 1000] }));
    expect((await consumeRateLimit(headers, policy)).allowed).toBe(true);
    expect((await consumeRateLimit(headers, policy)).allowed).toBe(true);
    await expect(consumeRateLimit(headers, policy)).resolves.toEqual({ allowed: false, retryAfter: 1 });
    expect((await consumeRateLimit(headers, policy)).allowed).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(new Set(fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body)[3])).size).toBe(1);
  });

  it("rounds Retry-After up to whole seconds", async () => {
    fetchMock.mockResolvedValue(Response.json({ result: [0, 2501] }));
    await expect(consumeRateLimit(headers, { ...policy, windowMs: 3000 })).resolves.toEqual({ allowed: false, retryAfter: 3 });
  });

  it("keeps the same key across cold starts and isolates different IPs/buckets", async () => {
    await consumeRateLimit(headers, policy);
    vi.resetModules();
    const fresh = await import("../rate-limit");
    await fresh.consumeRateLimit(headers, policy);
    await consumeRateLimit(new Headers({ "x-forwarded-for": "192.0.2.2" }), policy);
    await consumeRateLimit(headers, { ...policy, bucket: "other" });
    const keys = fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body)[3]);
    expect(keys[0]).toBe(keys[1]);
    expect(new Set(keys).size).toBe(3);
  });

  it.each([
    ["UPSTASH_REDIS_REST_URL", ""],
    ["UPSTASH_REDIS_REST_TOKEN", ""],
    ["UPSTASH_REDIS_REST_URL", "http://redis.example.test"],
    ["UPSTASH_REDIS_REST_URL", "not a URL"],
  ])("fails closed for invalid configuration %s=%j", async (name, value) => {
    vi.stubEnv(name, value);
    await expect(consumeRateLimit(headers, policy)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([null, [], [1], [2, 100], [0, -1], [1, "1000"], [0, 1001], [1, 1.1]])(
    "rejects invalid store result %j", async (result) => {
      fetchMock.mockResolvedValue(Response.json({ result }));
      await expect(consumeRateLimit(headers, policy)).rejects.toThrow("Invalid rate limit response");
    },
  );

  it("rejects non-OK responses, Redis errors, invalid JSON and network timeouts", async () => {
    fetchMock.mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    await expect(consumeRateLimit(headers, policy)).rejects.toThrow();
    fetchMock.mockResolvedValueOnce(Response.json({ error: "store error" }));
    await expect(consumeRateLimit(headers, policy)).rejects.toThrow();
    fetchMock.mockResolvedValueOnce(new Response("not JSON"));
    await expect(consumeRateLimit(headers, policy)).rejects.toThrow();
    fetchMock.mockRejectedValueOnce(new DOMException("Timed out", "TimeoutError"));
    await expect(consumeRateLimit(headers, policy)).rejects.toThrow();
  });
});

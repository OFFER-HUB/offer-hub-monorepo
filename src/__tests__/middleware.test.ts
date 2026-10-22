// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { middleware, config } from "../middleware";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("RATE_LIMIT_IP_HEADER", "");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.test");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async () => Response.json({ result: [1, 1000] }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function request(path: string, method = "GET") {
  return new NextRequest(`https://offer-hub.tech${path}`, {
    method, headers: { "x-forwarded-for": "192.0.2.1" },
  });
}

describe("API middleware", () => {
  it.each(["development", "test"])(
    "allows API requests without Redis configuration in %s", async (environment) => {
      vi.stubEnv("NODE_ENV", environment);
      vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
      vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
      const req = new NextRequest("https://offer-hub.tech/api/contact", {
        method: "POST", body: JSON.stringify({ company: "Acme" }),
      });

      const response = await middleware(req);

      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.has("Retry-After")).toBe(false);
      expect(req.bodyUsed).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each(["development", "test"])(
    "skips the limiter even when Redis is configured in %s", async (environment) => {
      vi.stubEnv("NODE_ENV", environment);
      fetchMock.mockRejectedValue(new Error("Redis unavailable"));

      const response = await middleware(request("/docs/guide/escrow/raw"));

      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["/api/waitlist", "POST", 5, 600_000],
    ["/api/contact", "POST", 5, 600_000],
    ["/api/privacy/export", "POST", 10, 900_000],
    ["/api/privacy/delete", "POST", 10, 900_000],
    ["/api/privacy/confirm", "POST", 10, 900_000],
    ["/api/docs-raw/guide/escrow", "GET", 120, 60_000],
    ["/api/mcp", "GET", 120, 60_000],
    ["/api/mcp", "POST", 30, 60_000],
    ["/api/mcp", "DELETE", 30, 60_000],
    ["/api/future-route", "PATCH", 30, 60_000],
    ["/api/waitlist/", "POST", 5, 600_000],
    ["/docs/guide/escrow/raw", "GET", 120, 60_000],
  ])("protects %s %s before route work", async (path, method, limit, windowMs) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://offer-hub.tech${path}` })).toBe(true);
    const response = await middleware(request(path, method));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).slice(-2)).toEqual([String(limit), String(windowMs)]);
  });

  it.each(["/", "/contact", "/docs", "/docs/guide/escrow", "/llms.txt", "/_next/static/app.js"])(
    "does not intercept the page or asset %s", (path) => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://offer-hub.tech${path}` })).toBe(false);
    },
  );

  it("returns uncached 429 and Retry-After without reading the request body", async () => {
    fetchMock.mockResolvedValue(Response.json({ result: [0, 120_001] }));
    const req = new NextRequest("https://offer-hub.tech/api/contact", {
      method: "POST", body: JSON.stringify({ company: "Acme" }),
    });
    const response = await middleware(req);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("121");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: {
      code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later.",
    } });
    expect(req.bodyUsed).toBe(false);
    expect(response.headers.has("x-middleware-next")).toBe(false);
  });

  it("returns generic 503 when the store is unavailable, without leaking details", async () => {
    fetchMock.mockRejectedValue(new Error("secret credential or endpoint"));
    const response = await middleware(request("/api/mcp", "POST"));
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).not.toContain("secret credential");
    expect(response.headers.has("x-middleware-next")).toBe(false);
  });

  it.each(["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"])(
    "fails closed in production when %s is missing", async (variable) => {
      vi.stubEnv(variable, "");
      const response = await middleware(request("/api/waitlist", "POST"));
      expect(response.status).toBe(503);
      expect(response.headers.get("Retry-After")).toBe("30");
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.has("x-middleware-next")).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});

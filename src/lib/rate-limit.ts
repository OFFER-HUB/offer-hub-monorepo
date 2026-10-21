export interface RateLimitPolicy {
  bucket: string;
  limit: number;
  windowMs: number;
}

/** Fixed windows start with the first request, shared across methods and paths. */
export function getRateLimitPolicy(pathname: string, method: string): RateLimitPolicy {
  if (pathname === "/api/privacy" || pathname.startsWith("/api/privacy/")) {
    return { bucket: "privacy", limit: 10, windowMs: 15 * 60_000 };
  }
  if (pathname === "/api/waitlist" || pathname === "/api/contact") {
    return { bucket: "forms", limit: 5, windowMs: 10 * 60_000 };
  }
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    return { bucket: "writes", limit: 30, windowMs: 60_000 };
  }
  return { bucket: "reads", limit: 120, windowMs: 60_000 };
}

// EVAL makes the check, increment and expiry one atomic operation. Blocked
// attempts neither increment the counter nor extend the original window.
export const RATE_LIMIT_SCRIPT = `
local ttl = redis.call("PTTL", KEYS[1])
if ttl < 0 then
  redis.call("SET", KEYS[1], 1, "PX", ARGV[2])
  return {1, tonumber(ARGV[2])}
end
local count = tonumber(redis.call("GET", KEYS[1]))
if count >= tonumber(ARGV[1]) then
  return {0, ttl}
end
redis.call("INCR", KEYS[1])
return {1, ttl}
`;

function normalizeIp(value: string): string | null {
  const ip = value.trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    const parts = ip.split(".").map(Number);
    return parts.every((part) => part <= 255) ? parts.join(".") : null;
  }
  // URL's IPv6 parser canonicalizes equivalent spellings. Do not accept a
  // forwarding chain, arbitrary text, ports or zone identifiers as an identity.
  if (!/^[0-9a-f:.]+$/i.test(ip) || !ip.includes(":")) return null;
  try {
    return new URL(`http://[${ip}]/`).hostname;
  } catch {
    return null;
  }
}

export function getRateLimitIdentity(headers: Headers): string {
  // Vercel overwrites X-Forwarded-For. Other deployments must explicitly name
  // a header their own ingress OVERWRITES and block access around that ingress.
  const header = process.env.RATE_LIMIT_IP_HEADER?.trim() ||
    (process.env.VERCEL === "1" ? "x-forwarded-for" : "");
  const value = header ? headers.get(header) : null;
  // Missing/untrusted addresses share a bucket, rather than bypassing limits.
  return value ? normalizeIp(value) ?? "unknown" : "unknown";
}

export async function consumeRateLimit(
  headers: Headers,
  policy: RateLimitPolicy,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!endpoint || !token || new URL(endpoint).protocol !== "https:") {
    throw new Error("Rate limiter is not configured");
  }

  const encoder = new TextEncoder();
  const secret = await crypto.subtle.importKey(
    "raw", encoder.encode(token), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC", secret, encoder.encode(getRateLimitIdentity(headers)),
  );
  const identity = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")).join("");
  const namespace = process.env.RATE_LIMIT_NAMESPACE?.trim() || "offerhub:rl:v1";
  const key = `${namespace}:${policy.bucket}:${identity}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", RATE_LIMIT_SCRIPT, "1", key, String(policy.limit), String(policy.windowMs)]),
    cache: "no-store",
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error("Rate limit store unavailable");

  const { result } = await response.json();
  if (!Array.isArray(result) || result.length !== 2 ||
    (result[0] !== 0 && result[0] !== 1) ||
    !Number.isSafeInteger(result[1]) || result[1] < 0 || result[1] > policy.windowMs) {
    throw new Error("Invalid rate limit response");
  }
  return { allowed: result[0] === 1, retryAfter: Math.max(1, Math.ceil(result[1] / 1000)) };
}

# Public API rate limiting and form spam protection

`src/middleware.ts` checks every request under `/api/` before the route handler
runs. It also checks `/docs/:slug*/raw`, which Next.js rewrites to the raw-docs
API after middleware runs. New API routes inherit protection automatically;
add any future public rewrite aliases to the middleware matcher too.

## Limits

Budgets are per client IP, shared across paths and methods within each row:

| Routes | Requests | Window | Bucket |
| --- | ---: | --- | --- |
| `/api/waitlist`, `/api/contact` | 5 total | 10 minutes | `forms` |
| `/api/privacy/*` (including export, delete and confirm) | 10 total | 15 minutes | `privacy` |
| All other API `POST`, `PUT`, `PATCH`, `DELETE` requests, including MCP | 30 total | 1 minute | `writes` |
| All other API `GET`, `HEAD`, `OPTIONS` requests, including MCP and raw docs | 120 total | 1 minute | `reads` |

Each window starts with the first request. A Redis Lua script atomically checks
the counter, increments it and sets its expiry. Concurrent requests across cold
starts, regions and serverless instances use the same counter. Rejected requests
do not increment it or extend its window. Redis removes expired keys, so no
cleanup job or process-local counter is needed. A fixed window can allow a burst
on either side of expiry; this is an abuse throttle, not DDoS protection.

Exceeded budgets return HTTP `429` with:

```json
{"error":{"code":"RATE_LIMIT_EXCEEDED","message":"Too many requests. Please try again later."}}
```

`Retry-After` is the remaining Redis TTL, rounded up to seconds (at least 1).
Clients should wait that long before retrying. Rejections have
`Cache-Control: no-store`, so they cannot poison shared documentation caches.
Allowed requests retain their normal response bodies and cache headers.

## Deployment setup

Configure these **server-only** environment variables before deploying:

- `UPSTASH_REDIS_REST_URL`: the HTTPS endpoint of a shared Upstash Redis database.
- `UPSTASH_REDIS_REST_TOKEN`: its write-capable REST token; the limiter uses `EVAL`,
  `GET`, `SET`, `INCR` and `PTTL`. A read-only token will not work.
- `RATE_LIMIT_NAMESPACE` (optional): defaults to `offerhub:rl:v1`. Use different
  namespaces for preview, development and production when sharing a database.
  All instances in one environment must use the same namespace and token.

The implementation uses the [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi),
Web Crypto and `fetch`, which work in Next.js Edge middleware without a TCP
connection or additional SDK dependency. Allow outbound HTTPS to that endpoint.
Each matched request makes one `EVAL` call; provision Redis capacity accordingly.

Missing credentials, a non-HTTPS endpoint, Redis errors, invalid responses and
network failures (including a 2-second timeout) **fail closed**: API requests get
HTTP `503 SERVICE_UNAVAILABLE`, `Retry-After: 30` and `Cache-Control: no-store`.
Handlers do not run. This applies in development too; there is no unprotected
in-memory fallback. Pages outside the matcher continue to load. Provision and
configure Redis before merging/deploying this change, and alert on API `503`s.
Builds and mocked unit tests do not require credentials.

## Trusted client IP

On Vercel (`VERCEL=1`), the limiter uses `x-forwarded-for`, which
[Vercel overwrites to prevent spoofing](https://vercel.com/docs/headers/request-headers#x-forwarded-for).
For other deployments, set `RATE_LIMIT_IP_HEADER` to the header your trusted
ingress **overwrites with one client IP**, such as `x-real-ip`. Restrict origin
access to that ingress. Do not pass through caller-supplied headers or configure
a header that appends a comma-separated proxy chain. When Vercel is behind
another proxy, verify its IP forwarding configuration before deployment.

Unconfigured, missing or malformed addresses share an `unknown` bucket. They
cannot evade limits by inventing arbitrary strings or changing an untrusted
header. IPv4 and IPv6 spellings are canonicalized before generating the key.
NAT users share a public-IP budget; IPv6 users with multiple addresses can still
spread requests across addresses. Adjust policy values to observed traffic.

Redis keys contain only the bucket and an HMAC-SHA-256 digest of the address,
keyed with the server-only Redis token. Raw IPs are neither sent to Redis nor
logged by this limiter. Token rotation or a namespace change starts fresh
budgets. These counters do not contain form data or privacy confirmation tokens.

## Form honeypots

The waitlist and contact forms include an offscreen `website` text input, excluded
from keyboard navigation and the accessibility tree, with autocomplete disabled.
Their hooks preserve the field when parsing form state. Both API handlers use
shared Zod schemas that accept the field only when absent or exactly `""`;
filled strings, whitespace and non-string values return `400` before database
access. The field is never persisted. Omitting it remains valid for existing API
clients. Bots that deliberately omit the trap are still subject to rate limits.

## Verification

```bash
npm run test -- src/lib/__tests__/rate-limit.test.ts src/__tests__/middleware.test.ts
npm run test -- src/app/api/waitlist/__tests__/route.test.ts src/app/api/contact/__tests__/route.test.ts
npm run test:coverage
npm run lint
npm run build
```

Unit tests mock Redis HTTP responses and exercise allowed, limited and reset
decisions, TTL rounding, cold-start key stability, IP isolation, trusted proxy
handling, fail-closed responses and matcher coverage (including the rewrite).
Form and route tests cover accessible trap fields and server-side rejection
before persistence. They make no external service calls.

To exercise the actual Lua script against a disposable local Redis instance,
install `redis-server` and run `python3 scripts/test-rate-limit-redis.py`.
Alternatively set `REDIS_SERVER=/path/to/redis-server`. This uses a temporary
Unix socket, no TCP listener, persistence or third-party service. It checks
window expiry/reset, independent keys, concurrent admission (exactly 3 of 20),
unchanged expiry on rejection and recovery of counters without an expiry.

For a deployment smoke test, use an isolated namespace and a trusted test IP.
Send five invalid JSON POSTs to `/api/waitlist`: the handler returns `400`, then
the sixth must return `429` with `Retry-After`. Verify `/api/contact` shares that
budget, a second IP has its own budget, and requests succeed again after expiry.
Only supply test IP headers through the configured trusted ingress. With Redis
unavailable, verify `503` and that no handler-side database or email calls run.

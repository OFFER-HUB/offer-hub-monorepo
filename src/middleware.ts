import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getRateLimitPolicy } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  try {
    const policy = getRateLimitPolicy(request.nextUrl.pathname.replace(/\/+$/, ""), request.method);
    const result = await consumeRateLimit(request.headers, policy);
    if (result.allowed) return NextResponse.next();

    return NextResponse.json(
      { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." } },
      { status: 429, headers: { "Retry-After": String(result.retryAfter), "Cache-Control": "no-store" } },
    );
  } catch {
    // Never silently disable protection on cold starts, missing configuration,
    // timeouts or store outages. No request reaches a handler in this case.
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Service temporarily unavailable." } },
      { status: 503, headers: { "Retry-After": "30", "Cache-Control": "no-store" } },
    );
  }
}

// Middleware runs before next.config rewrites, so include the public raw-docs
// alias as well as every method and future route under src/app/api.
export const config = { matcher: ["/api/:path*", "/docs/:slug*/raw"] };

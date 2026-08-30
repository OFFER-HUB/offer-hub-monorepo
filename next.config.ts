import type { NextConfig } from "next";
import { getSecurityHeaders } from "./config/security-headers";
import { logger } from "./src/utils/logger";
import { SITE_URL_FALLBACK } from "./src/constants/site";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  logger.warn(
    "\x1b[33m%s\x1b[0m",
    `⚠️ WARNING: NEXT_PUBLIC_SITE_URL is not set in the production environment. ` +
    `CORS will fall back to '${SITE_URL_FALLBACK}' which may cause client-side issues if the site is hosted elsewhere.`
  );
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK;

const corsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: siteUrl },
  { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
  {
    key: "Access-Control-Allow-Headers",
    value:
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = getSecurityHeaders();
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/:path*", headers: [...securityHeaders, ...corsHeaders] },
    ];
  },
  async rewrites() {
    // `[...slug]` is a catch-all and Next.js requires catch-all segments to be
    // the last part of a route, so `/docs/[...slug]/raw/route.ts` cannot exist
    // alongside `/docs/[...slug]/page.tsx`. The raw-Markdown handler instead
    // lives at the non-conflicting `/api/docs-raw/[...slug]` path, and this
    // rewrite keeps the public URL at the documented `/docs/<slug>/raw`.
    return [
      { source: "/docs/:slug*/raw", destination: "/api/docs-raw/:slug*" },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
    ],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    };
    return config;
  },
};

export default nextConfig;

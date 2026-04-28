import type { NextConfig } from "next";

// Validate CORS configuration at build time
const getCorsOrigin = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // In production, NEXT_PUBLIC_SITE_URL is required
  if (process.env.NODE_ENV === "production") {
    if (!siteUrl) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required in production environment. " +
          "Please set it in your environment variables. " +
          "Example: https://offer-hub.tech",
      );
    }
    return siteUrl;
  }

  // In development, use localhost:3000 as default
  return siteUrl || "http://localhost:3000";
};

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: getCorsOrigin(),
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

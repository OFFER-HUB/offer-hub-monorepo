import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude backend and services directories from Next.js compilation
  outputFileTracingExcludes: {
    "*": ["./backend/**/*", "./services/**/*"],
  },
  // Exclude backend and services from webpack compilation
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/backend/**", "**/services/**", "**/node_modules"],
    };
    return config;
  },
};

export default nextConfig;

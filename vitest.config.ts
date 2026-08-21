import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./vitest.globalSetup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
      ],
      /**
       * Two tiers, on purpose.
       *
       * The per-glob numbers guard the layers that read or write user data —
       * services, the Supabase client, the GDPR endpoints, and the hooks that
       * drive the forms. Those are fully covered today and a drop there is a
       * real regression, so the bar sits just under where they landed.
       *
       * The global numbers are the floor for everything else, which is still
       * mostly presentational components with no tests. They are deliberately
       * set at what this work actually reaches rather than at an aspirational
       * figure that would get disabled on the first red build. Ratchet them
       * up as component coverage lands.
       */
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 30,
        lines: 40,

        "src/services/**": {
          statements: 95,
          branches: 88,
          functions: 100,
          lines: 95,
        },
        "src/hooks/**": {
          statements: 95,
          branches: 92,
          functions: 100,
          lines: 95,
        },
        "src/lib/{supabase,seo,mdx}.ts": {
          statements: 95,
          branches: 90,
          functions: 100,
          lines: 95,
        },
        "src/app/api/**": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
});

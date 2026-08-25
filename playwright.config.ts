import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

/**
 * Route-level a11y/e2e checks against a real production build, as opposed
 * to the component-level vitest-axe tests (RTL + jsdom). See issue #1499:
 * these are what actually verify "route X passes WCAG 2.1 AA," not the
 * component tests. Also covers the responsive/viewport regression suite.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});

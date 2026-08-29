import { configureAxe } from "vitest-axe";

/**
 * Shared axe instance for component-level a11y regression tests (issue #1499).
 * `region` is disabled because RTL renders components in isolation, outside
 * the landmark structure axe expects a full page to have.
 */
export const axe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});

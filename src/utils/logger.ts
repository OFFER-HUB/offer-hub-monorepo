/**
 * Minimal console wrapper respecting NODE_ENV.
 *
 * - debug/info/log: suppressed outside development (noisy in production,
 *   and can leak internal details into browser consoles).
 * - warn/error: always emitted — production needs to see real failures,
 *   just routed through one place so behavior (e.g. adding Sentry later)
 *   changes in one file instead of ~20 scattered call sites.
 */

const isDev = process.env.NODE_ENV === "development";

function withPrefix(args: unknown[]): unknown[] {
  return args;
}

export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDev) console.debug(...withPrefix(args));
  },
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...withPrefix(args));
  },
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...withPrefix(args));
  },
  warn: (...args: unknown[]): void => {
    console.warn(...withPrefix(args));
  },
  error: (...args: unknown[]): void => {
    console.error(...withPrefix(args));
  },
};
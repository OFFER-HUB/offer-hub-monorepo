/**
 * The single email-shape check used across the app: the contact form and
 * the GDPR data-rights routes (`/api/privacy/export`, `/api/privacy/delete`).
 *
 * Excludes whitespace *and* `@` from both the local part and the domain —
 * unlike a looser `\S+@\S+\.\S+` check, this correctly rejects addresses
 * like `a@@b.co` or `a@b@c.co`. That distinction matters here specifically:
 * before this was unified, the contact form used the looser pattern while
 * the privacy routes used this one, so a visitor could submit an address
 * through the contact form that the GDPR export/delete endpoints would then
 * refuse to recognize as valid for their own stored data.
 *
 * This is intentionally a shape check, not full RFC 5322 validation —
 * good enough to catch typos and it can't be much stricter without
 * risking false rejections of real addresses.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

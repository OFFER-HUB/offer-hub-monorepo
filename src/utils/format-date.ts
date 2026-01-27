/**
 * Format date consistently for SSR (no locale-dependent formatting)
 * This prevents hydration mismatches between server and client
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Format date as "Jan 15" (month + day)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  return `${month} ${day}`;
}

/**
 * Format date as "Jan 15, 2024" (month + day + year)
 */
export function formatDateMedium(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Format date as "January 15, 2024" (full month + day + year)
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = MONTHS_FULL[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

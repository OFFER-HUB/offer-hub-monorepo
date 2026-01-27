/**
 * Format number consistently for SSR (no locale-dependent formatting)
 * This prevents hydration mismatches between server and client
 */
export function formatNumber(num: number): string {
  // Use a consistent format that doesn't depend on locale
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format currency consistently
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `$${formatNumber(amount)}`;
}

/**
 * Format currency with hourly rate
 */
export function formatHourlyRate(amount: number): string {
  return `$${formatNumber(amount)}/hr`;
}

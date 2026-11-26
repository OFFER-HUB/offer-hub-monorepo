/**
 * TODO: verify the registered office address before production.
 * Flagged in issue #1481 as placeholder content — no mailbox is published
 * until confirmed; general, legal, privacy, and brand inquiries route to /contact.
 */
export const COMPANY_INFO = {
  name: "OFFER-HUB Inc.",
  address: {
    line1: "123 Market Street, Suite 400",
    line2: "San Francisco, CA 94105, USA",
  },
  contactPath: "/contact",
} as const;
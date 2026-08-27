import { describe, it, expect } from "vitest";
import { isValidEmail } from "../email";

describe("isValidEmail", () => {
  it.each(["jane@acme.com", "j.doe+test@sub.acme.co"])(
    "accepts %j",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each([
    "not-an-email",
    "jane@acme",
    "jane acme.com",
    "@acme.com",
    "jane doe@acme.com",
    // Regression cases for the pre-unification divergence: the contact
    // form's old `\S+@\S+\.\S+` pattern accepted these because `\S`
    // excludes whitespace but not `@`, while the privacy routes'
    // `[^\s@]+@[^\s@]+\.[^\s@]+` (now the shared implementation) rejects
    // them. See offer-hub-monorepo#1476.
    "a@@b.co",
    "a@b@c.co",
  ])("rejects %j", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

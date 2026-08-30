import { describe, it, expect } from "vitest";
import { contactFormSchema } from "../contact.schema";
import { waitlistFormSchema } from "../waitlist.schema";
import { dataRightsSchema } from "../data-rights.schema";

const VALID_CONTACT = {
  company: "Acme Inc",
  name: "Jane Doe",
  email: "ok@mail.com",
  message: "",
};

const VALID_WAITLIST = {
  name: "Jane Doe",
  email: "ok@mail.com",
  purpose: "Marketplace integration",
  referral: "Friend",
};

describe("email validation parity", () => {
  it.each([
    ["a@@b.co", false],
    ["a@b@c.co", false],
    ["ok@mail.com", true],
    ["", false],
    ["not-an-email", false],
    ["jane@acme", false],
    ["@acme.com", false],
    ["jane doe@acme.com", false],
  ])("treats %s identically across all schemas (valid=%s)", (email, expected) => {
    const contact = contactFormSchema.safeParse({ ...VALID_CONTACT, email });
    const waitlist = waitlistFormSchema.safeParse({ ...VALID_WAITLIST, email });
    const dataRights = dataRightsSchema.safeParse({ email });

    expect(contact.success).toBe(expected);
    expect(waitlist.success).toBe(expected);
    expect(dataRights.success).toBe(expected);
  });
});

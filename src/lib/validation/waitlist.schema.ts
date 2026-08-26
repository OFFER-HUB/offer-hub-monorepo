import { z } from "zod";
import { emailField } from "./email";

export const waitlistFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: emailField.max(320, "Email must be 320 characters or fewer"),
  purpose: z
    .string()
    .trim()
    .min(1, "Please tell us how you would use Offer Hub")
    .max(500, "Purpose must be 500 characters or fewer"),
  referral: z
    .string()
    .trim()
    .min(1, "Please tell us how you heard about us")
    .max(200, "Referral must be 200 characters or fewer"),
});

export type WaitlistFormPayload = z.infer<typeof waitlistFormSchema>;

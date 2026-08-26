import { z } from "zod";
import { EMAIL_REGEX, EMAIL_INVALID_MESSAGE } from "./email";

const contactEmailField = z
  .string()
  .trim()
  .min(1, "Work email is required")
  .regex(EMAIL_REGEX, EMAIL_INVALID_MESSAGE);

export const contactFormSchema = z.object({
  company: z.string().trim().min(1, "Company name is required"),
  name: z.string().trim().min(1, "Contact name is required"),
  email: contactEmailField,
  message: z.string().trim().optional().default(""),
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

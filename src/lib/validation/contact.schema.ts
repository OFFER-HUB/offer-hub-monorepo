import { z } from "zod";
import { emailField } from "./email";

export const contactFormSchema = z.object({
  company: z.string().trim().min(1, "Company name is required"),
  name: z.string().trim().min(1, "Contact name is required"),
  email: emailField,
  message: z.string().trim().optional().default(""),
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

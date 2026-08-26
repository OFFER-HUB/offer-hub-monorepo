import { z } from "zod";
import { emailField, EMAIL_REQUIRED_MESSAGE } from "./email";

export const dataRightsSchema = z.object({
  email: emailField,
});

export type DataRightsPayload = z.infer<typeof dataRightsSchema>;

/** Message used by GDPR API routes for invalid email. */
export const DATA_RIGHTS_EMAIL_ERROR = EMAIL_REQUIRED_MESSAGE;

import { z } from "zod";
import { EMAIL_REGEX, EMAIL_REQUIRED_MESSAGE } from "./email";

const dataRightsEmailField = z
  .string()
  .trim()
  .min(1, EMAIL_REQUIRED_MESSAGE)
  .regex(EMAIL_REGEX, EMAIL_REQUIRED_MESSAGE);

export const dataRightsSchema = z.object({
  email: dataRightsEmailField,
});

export type DataRightsPayload = z.infer<typeof dataRightsSchema>;

/** Message used by GDPR API routes for invalid email. */
export const DATA_RIGHTS_EMAIL_ERROR = EMAIL_REQUIRED_MESSAGE;

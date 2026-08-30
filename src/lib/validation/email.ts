import { z } from "zod";

/** Canonical email rule — rejects a@@b.co and a@b@c.co. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_REQUIRED_MESSAGE = "A valid email address is required.";
export const EMAIL_INVALID_MESSAGE = "Enter a valid work email";

export const emailField = z
  .string()
  .trim()
  .min(1, EMAIL_REQUIRED_MESSAGE)
  .regex(EMAIL_REGEX, EMAIL_INVALID_MESSAGE);

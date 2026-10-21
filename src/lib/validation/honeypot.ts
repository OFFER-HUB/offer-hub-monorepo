import { z } from "zod";

// Optional for existing API clients. Any supplied value must be exactly empty;
// do not trim whitespace or coerce non-string values into an empty string.
export const honeypotField = z.string().max(0, "Invalid submission").optional();

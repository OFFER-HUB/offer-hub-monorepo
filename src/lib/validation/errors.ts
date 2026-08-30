import type { ZodError } from "zod";

export function formatFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function validationErrorResponse(errors: Record<string, string>) {
  return { errors };
}

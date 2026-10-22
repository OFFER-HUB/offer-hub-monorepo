import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  DATA_RIGHTS_TOKEN_TTL_MS,
  DATA_RIGHTS_TOKENS_TABLE,
  generateDataRightsToken,
  hashDataRightsToken,
  type DataRightsAction,
} from "@/lib/data-rights-tokens";
import {
  dataRightsSchema,
  DATA_RIGHTS_EMAIL_ERROR,
} from "@/lib/validation/data-rights.schema";
import {
  formatFieldErrors,
  validationErrorResponse,
} from "@/lib/validation/errors";
import { SITE_URL_FALLBACK } from "@/constants/site";
import { logger } from "@/utils/logger";

export const DATA_RIGHTS_REQUEST_MESSAGE =
  "If we hold a record for that email address, we have sent a confirmation link to it. The link is valid for 30 minutes and can be used once.";

const ACTION_COPY: Record<DataRightsAction, { subject: string; intro: string }> = {
  export: {
    subject: "Confirm your OFFER-HUB data export",
    intro: "We received a request to export the personal data we hold for this email address.",
  },
  delete: {
    subject: "Confirm your OFFER-HUB data deletion",
    intro: "We received a request to permanently delete the personal data we hold for this email address.",
  },
};

export async function handleDataRightsRequest(
  req: NextRequest,
  action: DataRightsAction,
): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  const parsed = dataRightsSchema.safeParse(body ?? {});

  if (!parsed.success) {
    // dataRightsSchema only validates `email`, so any failure is an email
    // failure — normalize it to the user-facing message.
    const errors = formatFieldErrors(parsed.error);
    errors.email = DATA_RIGHTS_EMAIL_ERROR;
    return NextResponse.json(validationErrorResponse(errors), { status: 400 });
  }

  const { email } = parsed.data;
  const admin = getSupabaseAdmin();

  if (!admin || !isMailerConfigured()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

  // Every outcome past this point answers with the same generic response so
  // the endpoint cannot be used to check whether an email is registered.
  const generic = NextResponse.json({ message: DATA_RIGHTS_REQUEST_MESSAGE });

  try {
    const { data: existing, error: lookupError } = await admin
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError || !existing) return generic;

    const token = generateDataRightsToken();
    const { error: insertError } = await admin
      .from(DATA_RIGHTS_TOKENS_TABLE)
      .insert([
        {
          token_hash: hashDataRightsToken(token),
          email,
          action,
          expires_at: new Date(Date.now() + DATA_RIGHTS_TOKEN_TTL_MS).toISOString(),
        },
      ]);

    if (insertError) {
      logger.error("data-rights: failed to store token", insertError.message);
      return generic;
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK).replace(/\/$/, "");
    const copy = ACTION_COPY[action];
    const sent = await sendMail({
      to: email,
      subject: copy.subject,
      text: `${copy.intro}\n\nConfirm the request within 30 minutes (the link works once):\n${siteUrl}/privacy/confirm?token=${token}\n\nIf you did not make this request, ignore this email and nothing will happen.`,
    });

    if (!sent) logger.error("data-rights: confirmation email was not accepted");
  } catch (err) {
    logger.error("data-rights: request failed", err);
  }

  return generic;
}

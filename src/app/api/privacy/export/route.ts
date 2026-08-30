import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { WaitlistRow } from "@/types/database";
import {
  dataRightsSchema,
  DATA_RIGHTS_EMAIL_ERROR,
} from "@/lib/validation/data-rights.schema";
import {
  formatFieldErrors,
  validationErrorResponse,
} from "@/lib/validation/errors";

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("waitlist")
    .select("*")
    .eq("email", email)
    .maybeSingle<WaitlistRow>();

  if (error) {
    return NextResponse.json(
      { error: "Failed to retrieve data." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "No record found for that email address." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data });
}

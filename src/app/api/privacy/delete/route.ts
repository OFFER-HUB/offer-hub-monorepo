import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
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
    const errors = formatFieldErrors(parsed.error);
    if (errors.email) {
      errors.email = DATA_RIGHTS_EMAIL_ERROR;
    }
    return NextResponse.json(validationErrorResponse(errors), { status: 400 });
  }

  const { email } = parsed.data;

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "No record found for that email address." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("waitlist").delete().eq("email", email);

  if (error) {
    return NextResponse.json(
      { error: "Failed to process deletion request." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message:
      "Your data has been successfully deleted. Per GDPR Article 17, deletion is confirmed within 30 days.",
  });
}

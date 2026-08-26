import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { waitlistFormSchema } from "@/lib/validation/waitlist.schema";
import {
  formatFieldErrors,
  validationErrorResponse,
} from "@/lib/validation/errors";

const UNIQUE_VIOLATION = "23505";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  const parsed = waitlistFormSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      validationErrorResponse(formatFieldErrors(parsed.error)),
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

  const { email, name, purpose, referral } = parsed.data;

  const { error } = await supabase.from("waitlist").insert([
    {
      email,
      name,
      purpose,
      referral,
    },
  ]);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to process waitlist submission." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

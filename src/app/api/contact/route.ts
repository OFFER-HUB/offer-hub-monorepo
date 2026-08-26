import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { contactFormSchema } from "@/lib/validation/contact.schema";
import {
  formatFieldErrors,
  validationErrorResponse,
} from "@/lib/validation/errors";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body ?? {});

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

  const { company, name, email, message } = parsed.data;

  const { error } = await supabase.from("contact_inquiries").insert([
    {
      company,
      contact_name: name,
      email,
      message,
    },
  ]);

  if (error) {
    return NextResponse.json(
      { error: "Failed to process contact inquiry." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

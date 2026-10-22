import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  DATA_RIGHTS_TOKENS_TABLE,
  hashDataRightsToken,
  type DataRightsAction,
} from "@/lib/data-rights-tokens";
import { dataRightsConfirmSchema } from "@/lib/validation/data-rights.schema";
import type { WaitlistRow } from "@/types/database";

const INVALID_TOKEN_MESSAGE = "This confirmation link is invalid or has expired.";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  const parsed = dataRightsConfirmSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

  // One conditional UPDATE makes consumption atomic: of two concurrent
  // requests with the same token only one matches `used_at IS NULL`.
  const { data: consumed, error: consumeError } = await admin
    .from(DATA_RIGHTS_TOKENS_TABLE)
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hashDataRightsToken(parsed.data.token))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("email, action")
    .maybeSingle<{ email: string; action: DataRightsAction }>();

  if (consumeError) {
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 },
    );
  }

  if (!consumed) {
    return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 });
  }

  if (consumed.action === "export") {
    const { data, error } = await admin
      .from("waitlist")
      .select("*")
      .eq("email", consumed.email)
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

    return NextResponse.json({ action: "export", data });
  }

  const { error } = await admin
    .from("waitlist")
    .delete()
    .eq("email", consumed.email);

  if (error) {
    return NextResponse.json(
      { error: "Failed to process deletion request." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    action: "delete",
    message:
      "Your data has been successfully deleted. Per GDPR Article 17, deletion is confirmed within 30 days.",
  });
}

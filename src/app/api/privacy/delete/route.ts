import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidEmail } from '@/utils/email-validation';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email ?? '').trim();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'A valid email address is required.' },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable.' },
      { status: 503 },
    );
  }

  const { data: existing } = await supabase
    .from('waitlist')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: 'No record found for that email address.' },
      { status: 404 },
    );
  }

  const { error } = await supabase.from('waitlist').delete().eq('email', email);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to process deletion request.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: 'Your data has been successfully deleted. Per GDPR Article 17, deletion is confirmed within 30 days.',
  });
}

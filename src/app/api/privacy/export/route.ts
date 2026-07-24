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

  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve data.' },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'No record found for that email address.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data });
}

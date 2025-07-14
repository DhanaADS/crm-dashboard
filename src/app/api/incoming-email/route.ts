import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log('📩 Raw Body:', rawBody);

    const parsed = await simpleParser(rawBody);
    const from = parsed.from?.text || 'Unknown Sender';
    const subject = parsed.subject || '(No Subject)';
    const body =
      parsed.text?.trim() ||
      (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]*>/g, '').trim() : '') ||
      '(No body)';

    console.log('✅ Parsed:', { from, subject, body });

    const { error } = await supabase.from('incoming_emails').insert({
      from_email: from,
      subject,
      body,
    });

    if (error) {
      console.error('❌ Supabase Insert Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ from, subject, body }, { status: 200 });
  } catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  console.error('❌ Handler Error:', errorMessage);
  return NextResponse.json({ error: errorMessage }, { status: 500 });
 }
}

export async function GET() {
  return NextResponse.json({ message: '✅ Webhook live. POST to store email.' });
}
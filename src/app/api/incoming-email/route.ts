import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const parsed = await simpleParser(rawBody);

  const from = parsed.from?.text || 'Unknown Sender';
  const subject = parsed.subject || '(No Subject)';
  const body =
    parsed.text?.trim() ||
    (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]*>/g, '').trim() : '') ||
    '(No body)';

  // ✅ Store in Supabase
  const { error } = await supabase.from('incoming_emails').insert([
    { from_email: from, subject, body }
  ]);

  if (error) {
    console.error('❌ Supabase Insert Error:', error.message);
    return NextResponse.json({ error: 'Failed to store email' }, { status: 500 });
  }

  return NextResponse.json({ message: '✅ Email parsed & stored', from, subject, body });
}

export async function GET() {
  return NextResponse.json({
    message: '✅ Webhook is live. To test, send a POST request (like Mailgun will).',
  });
}
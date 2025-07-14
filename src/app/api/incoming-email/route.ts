import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

// Supabase Client (using ENV variables)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const parsed = await simpleParser(rawBody);

    const from = parsed.from?.text || 'Unknown Sender';
    const subject = parsed.subject || '(No Subject)';
    const body =
      parsed.text?.trim() ||
      (typeof parsed.html === 'string'
        ? parsed.html.replace(/<[^>]*>/g, '').trim()
        : '') ||
      '(No body)';

    // Save to Supabase
    const { error } = await supabase.from('incoming_emails').insert([
      {
        from_email: from,
        subject,
        body,
      },
    ]);

    if (error) {
      console.error('❌ Supabase Insert Error:', error);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    console.log('✅ Received Email:', { from, subject, body });
    return NextResponse.json({ status: 'success', from, subject, body });
  } catch (err) {
    console.error('❌ Email Parsing Error:', err);
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 });
  }
}

// Optional: Keep GET for health check
export async function GET() {
  return NextResponse.json({
    message: '✅ Webhook is live. To test, send a POST request (like Mailgun will).',
  });
}
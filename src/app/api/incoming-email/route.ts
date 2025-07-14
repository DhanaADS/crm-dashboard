import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const from = params.get('from') || 'Unknown Sender';
    const subject = params.get('subject') || '(No Subject)';
    const body = params.get('body-plain')?.trim() || '(No body)';

    console.log('✅ Clean Parsed:', { from, subject, body });

    // Step 2: Optional deduplication (based on from + subject + body hash)
    const exists = await supabase
      .from('incoming_emails')
      .select('id')
      .eq('from_email', from)
      .eq('subject', subject)
      .eq('body', body)
      .limit(1)
      .maybeSingle();

    if (exists.data) {
      return NextResponse.json({ message: 'Duplicate email skipped.' }, { status: 200 });
    }

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
  return NextResponse.json({
    message: '✅ Webhook live. POST to store email cleanly.',
  });
}
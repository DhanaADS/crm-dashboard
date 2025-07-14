import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const parsed = await simpleParser(rawBody);

    const from = parsed.from?.text || 'Unknown Sender';
    const subject = parsed.subject || '(No Subject)';
    const body =
      parsed.text?.trim() ||
      (parsed.html && typeof parsed.html === 'string'
        ? parsed.html.replace(/<[^>]*>/g, '').trim()
        : '') ||
      '(No body)';

    // 🪵 Debug: Log the parsed email content
    console.log('📨 Received Email:', { from, subject, body });

    return NextResponse.json({ from, subject, body });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook failed to process email' }, { status: 500 });
  }
}

// ✅ Optional: Handle GET requests (visible in browser for manual check)
export async function GET() {
  return NextResponse.json({
    message: '✅ Webhook is live. To test, send a POST request (like Mailgun will).',
  });
}
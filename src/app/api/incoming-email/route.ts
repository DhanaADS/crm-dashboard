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
      (typeof parsed.html === 'string'
        ? parsed.html.replace(/<[^>]*>/g, '').trim()
        : '') ||
      '(No body)';

    console.log('📩 Email received:', { from, subject, body });

    return NextResponse.json({ from, subject, body });
  } catch (error) {
    console.error('❌ Email parse failed:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: '✅ Webhook is live. To test, send a POST request (like Mailgun will).',
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';

export async function POST(req: NextRequest) {
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

  return NextResponse.json({ from, subject, body });
}

// ✅ TEMPORARY - for 405 debugging
export async function GET() {
  return NextResponse.json({
    message:
      '✅ Webhook is live. To test, send a POST request (like Mailgun will).',
  });
}
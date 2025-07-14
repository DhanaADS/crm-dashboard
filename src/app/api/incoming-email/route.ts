import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { simpleParser } from 'mailparser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const parsed = await simpleParser(rawBody)

    const from = parsed.from?.text || 'Unknown Sender'
    const subject = parsed.subject || '(No Subject)'
    const body =
      parsed.text?.trim() ||
      (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]*>/g, '').trim() : '') ||
      '(No body)'

    // Insert into Supabase table "incoming_emails"
    const { error } = await supabase.from('incoming_emails').insert({
      from,
      subject,
      body,
      received_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, from, subject, body })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Optional: GET endpoint to verify webhook is up
export async function GET() {
  return NextResponse.json({ message: '✅ Webhook live and ready' })
}
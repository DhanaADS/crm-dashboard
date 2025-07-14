// src/app/api/incoming-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { simpleParser } from 'mailparser'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const buffer = await req.arrayBuffer()
    const parsed = await simpleParser(Buffer.from(buffer))

    const from = parsed.from?.text || 'Unknown Sender'
    const subject = parsed.subject || '(No Subject)'
    const body =
      parsed.text?.trim() ||
      parsed.html?.replace(/<[^>]*>/g, '').trim() ||
      '(No body)'

    return NextResponse.json({ from, subject, body })
  } catch (error) {
    console.error('Email parsing error:', error)
    return NextResponse.json({ error: 'Failed to parse email' }, { status: 500 })
  }
}
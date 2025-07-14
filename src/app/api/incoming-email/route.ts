// src/app/api/incoming-email/route.ts
import { simpleParser } from 'mailparser'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const parsed = await simpleParser(rawBody)

    const from = parsed.from?.text || 'Unknown Sender'
    const subject = parsed.subject || '(No Subject)'

    let body = '(No body)'
    if (parsed.text) {
      body = parsed.text.trim()
    } else if (typeof parsed.html === 'string') {
      body = parsed.html.replace(/<[^>]*>/g, '').trim()
    }

    console.log('Parsed Email:', { from, subject, body })

    return NextResponse.json({ from, subject, body }, { status: 200 })
  } catch (error) {
    console.error('Email parse failed:', error)
    return NextResponse.json({ error: 'Failed to parse email' }, { status: 500 })
  }
}
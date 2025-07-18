import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🔧 Enrich email body with clues if links/attachments are found
function enrichEmailBody(body: string): string {
  if (!body) return body

  let enriched = body

  if (body.includes('docs.google.com')) {
    enriched += '\n(Note: Google Docs link attached — likely a draft or article.)'
  }

  if (body.includes('drive.google.com')) {
    enriched += '\n(Note: Google Drive attachment — probably a document or media file.)'
  }

  if (body.includes('dropbox.com')) {
    enriched += '\n(Note: Dropbox file link — possibly a shared resource.)'
  }

  if (body.toLowerCase().includes('attachment')) {
    enriched += '\n(Note: Email mentions an attachment — summarize expected action.)'
  }

  return enriched
}

export async function POST(req: NextRequest) {
  try {
    const { message, emailId } = await req.json()

    // ✅ Backend safeguard: avoid duplicate summaries
const { data: existing, error: fetchError } = await supabase
  .from('incoming_emails')
  .select('summary')
  .eq('id', emailId)
  .single()

if (existing?.summary) {
  console.log(`Summary already exists for email ID ${emailId}`)
  return NextResponse.json({ summary: existing.summary })
}

    if (!message || !emailId) {
      return NextResponse.json({ error: 'Missing email body or ID' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 })
    }

    console.log('Using Gemini model: gemini-1.5-flash')

    const enrichedMessage = enrichEmailBody(message)

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Here is an email. Summarize the sender's intent clearly in one sentence. If the email contains links or attachments, mention what the sender is asking for in relation to them.\n\n"${enrichedMessage}"`
                }
              ]
            }
          ]
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Gemini API error:', result)
      return NextResponse.json({ error: 'Failed to get summary from Gemini API' }, { status: 500 })
    }

    const summaryRaw = result?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const summary =
      !summaryRaw || summaryRaw.trim().length < 5
        ? '📎 Email contains links or attachments — sender likely requests action.'
        : summaryRaw

    // ✅ Save summary to Supabase
    await supabase
      .from('incoming_emails')
      .update({ summary })
      .eq('id', emailId)

    // ✅ Optional: Send WhatsApp alert
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, summary })
      })
    } catch (err) {
      console.error('WhatsApp alert failed:', err)
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
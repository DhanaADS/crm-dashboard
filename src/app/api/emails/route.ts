// /src/app/api/emails/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('incoming_emails')
      .select('id, from_email, subject, body, created_at, summary') // ✅ optionally include summary
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const inbox = (data || []).map((email) => ({
      id: email.id,
      from: email.from_email || 'Unknown Sender',
      subject: email.subject || '(No Subject)',
      snippet: email.body?.slice(0, 100) || '(No content)',
      body: email.body || '',
      summary: email.summary || '', // ✅ include existing summary if any
      date: email.created_at ? new Date(email.created_at).toISOString() : null,
    }))

    return NextResponse.json({ inbox })
  } catch (err) {
    console.error('Unexpected server error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
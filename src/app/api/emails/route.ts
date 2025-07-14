// /src/app/api/emails/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Must match the env key exactly
)

export async function GET() {
  const { data, error } = await supabase
    .from('incoming_emails')
    .select('id, from_email, subject, body')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const inbox = data.map((email) => ({
    id: email.id,
    from: email.from_email,
    subject: email.subject,
    snippet: email.body?.slice(0, 100),
  }))

  return NextResponse.json({ inbox })
}
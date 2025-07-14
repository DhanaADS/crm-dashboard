import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { gmail_v1 } from 'googleapis'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.provider_token
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 })
  }

  try {
    const listRes = await fetch(`${GMAIL_API}?maxResults=10`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const listData: gmail_v1.Schema$ListMessagesResponse = await listRes.json()
    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ inbox: [] })
    }

    const emailPreviews = await Promise.all(
      listData.messages.map(async (msg) => {
        const detailRes = await fetch(`${GMAIL_API}/${msg.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const detail: gmail_v1.Schema$Message = await detailRes.json()

        const headers = detail.payload?.headers || []
        const fromHeader = headers.find((h) => h.name === 'From')
        const subjectHeader = headers.find((h) => h.name === 'Subject')

        return {
          id: detail.id || '',
          from: fromHeader?.value || 'Unknown Sender',
          subject: subjectHeader?.value || '(No Subject)',
          snippet: detail.snippet || '',
        }
      })
    )

    return NextResponse.json({ inbox: emailPreviews })
  } catch (err) {
    console.error('Gmail API error:', err)
    return NextResponse.json({ error: 'Failed to fetch Gmail data' }, { status: 500 })
  }
}
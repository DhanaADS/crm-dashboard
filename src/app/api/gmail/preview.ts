import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'

export async function GET(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.provider_token

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 })
  }

  try {
    // Step 1: Get unread message IDs
    const listRes = await fetch(`${GMAIL_API}?q=is:unread&maxResults=5`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const listData = await listRes.json()

    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    // Step 2: Fetch each message's snippet
    const emailPreviews = await Promise.all(
      listData.messages.map(async (msg: any) => {
        const detailRes = await fetch(`${GMAIL_API}/${msg.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        const detail = await detailRes.json()

        const headers = detail.payload.headers
        const fromHeader = headers.find((h: any) => h.name === 'From')
        const subjectHeader = headers.find((h: any) => h.name === 'Subject')

        return {
          id: detail.id,
          from: fromHeader?.value || 'Unknown Sender',
          subject: subjectHeader?.value || '(No Subject)',
          snippet: detail.snippet || '',
        }
      })
    )

    return NextResponse.json({ messages: emailPreviews })
  } catch (err) {
    console.error('Gmail API error:', err)
    return NextResponse.json({ error: 'Failed to fetch Gmail data' }, { status: 500 })
  }
}
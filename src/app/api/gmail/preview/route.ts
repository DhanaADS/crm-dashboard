// src/app/api/gmail/preview/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface GmailMessage {
  id: string
}

interface GmailHeader {
  name: string
  value: string
}

interface GmailPayload {
  headers: GmailHeader[]
}

interface GmailMessageDetail {
  id: string
  snippet: string
  payload: GmailPayload
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accessToken = session.provider_token

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const { messages }: { messages?: GmailMessage[] } = await res.json()
  if (!messages) return NextResponse.json({ inbox: [] })

  const emailPreviews = await Promise.all(
    messages.map(async (msg: GmailMessage) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const detail: GmailMessageDetail = await detailRes.json()

      return {
        id: msg.id,
        snippet: detail.snippet,
        subject:
          detail.payload?.headers?.find((h) => h.name === 'Subject')?.value || '',
      }
    })
  )

  return NextResponse.json({ inbox: emailPreviews })
}
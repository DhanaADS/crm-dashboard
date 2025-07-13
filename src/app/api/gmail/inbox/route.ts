// src/app/api/gmail/inbox/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(`${GMAIL_API}?q=is:unread&maxResults=5`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    })

    const data = await res.json()
    const messageIds = data.messages?.map((msg: any) => msg.id) || []

    const messages = await Promise.all(
      messageIds.map(async (id: string) => {
        const msgRes = await fetch(`${GMAIL_API}/${id}`, {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        })
        const msgData = await msgRes.json()
        const headers = msgData.payload.headers

        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No subject)'
        const from = headers.find((h: any) => h.name === 'From')?.value || '(Unknown sender)'

        return { id, subject, from }
      })
    )

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('Gmail fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch Gmail' }, { status: 500 })
  }
}
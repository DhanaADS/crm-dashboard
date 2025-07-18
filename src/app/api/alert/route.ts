// --- /src/app/api/alert/route.ts (WhatsApp alert) ---
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { emailId, summary } = await req.json()

    if (!emailId || !summary) {
      return NextResponse.json({ error: 'Missing email ID or summary' }, { status: 400 })
    }

    const phoneNumber = process.env.ADMIN_WHATSAPP_PHONE
    const token = process.env.WHATSAPP_ACCESS_TOKEN
    const numberId = process.env.WHATSAPP_NUMBER_ID

    if (!phoneNumber || !token || !numberId) {
      return NextResponse.json({ error: 'Missing WhatsApp credentials' }, { status: 500 })
    }

    const url = `https://graph.facebook.com/v18.0/${numberId}/messages`

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: `📬 New Summary for Email ID ${emailId}:\n${summary}`
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('WhatsApp API error:', data)
      return NextResponse.json({ error: 'Failed to send WhatsApp message', details: data }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Alert route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
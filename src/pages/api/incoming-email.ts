// src/pages/api/incoming-email.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { simpleParser } from 'mailparser'

export const config = {
  api: {
    bodyParser: false, // Needed to handle raw email
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const buffers: Uint8Array[] = []
    for await (const chunk of req) buffers.push(chunk)
    const rawEmail = Buffer.concat(buffers).toString()

    const parsed = await simpleParser(rawEmail)

    const subject = parsed.subject || '(No Subject)'
    const from = parsed.from?.text || 'Unknown Sender'
    const body = parsed.text?.slice(0, 300) || '(No body)'

    console.log('📨 Incoming Email:', { from, subject, body })

    // (Optional) Store in Supabase or just return response
    return res.status(200).json({ from, subject, body })
  } catch (error) {
    console.error('Parsing error:', error)
    return res.status(500).json({ error: 'Failed to parse email' })
  }
}
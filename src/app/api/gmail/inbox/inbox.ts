import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { google, gmail_v1 } from 'googleapis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const providerToken = session.provider_token

  if (!providerToken) {
    return res.status(400).json({ error: 'No provider token found' })
  }

  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: providerToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Fetch latest 5 unread emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 5,
    })

    const messages = response.data.messages || []

    const emailDetails = await Promise.all(
      messages.map(async (msg: gmail_v1.Schema$Message) => {
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
        })

        const headers = full.data.payload?.headers || []
        const subject =
          headers.find((h) => h.name === 'Subject')?.value || '(No Subject)'
        const from =
          headers.find((h) => h.name === 'From')?.value || '(Unknown Sender)'

        return {
          id: msg.id,
          subject,
          from,
        }
      })
    )

    res.status(200).json({ messages: emailDetails })
  } catch (error) {
    console.error('Gmail API Error:', error)
    res.status(500).json({ error: 'Failed to fetch inbox' })
  }
}
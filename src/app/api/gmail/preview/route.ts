// src/app/api/gmail/preview/route.ts

import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    // Get latest 10 messages without filtering
    const msgListRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messageIds = msgListRes.data.messages || [];

    const inbox = await Promise.all(
      messageIds.map(async (msg) => {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
        });

        const headers = fullMsg.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
        const snippet = fullMsg.data.snippet || '';

        return { id: msg.id, from, subject, snippet };
      })
    );

    return Response.json({ inbox });
  } catch (err) {
    console.error('Error fetching Gmail preview:', err);
    return Response.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}
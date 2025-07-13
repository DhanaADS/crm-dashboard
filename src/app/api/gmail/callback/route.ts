import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No auth code provided' }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_SITE_URL + '/api/gmail/callback'
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // You can now use the OAuth client to call Gmail APIs
    // or store tokens if needed

    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'OAuth token exchange failed' }, { status: 500 })
  }
}
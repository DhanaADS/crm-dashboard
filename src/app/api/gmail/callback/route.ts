import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No auth code provided' }, { status: 400 })
  }

  const redirectUri = process.env.NEXT_PUBLIC_SITE_URL + '/api/gmail/callback'
  console.log('OAuth Redirect URI:', redirectUri)

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    redirectUri
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const redirectTarget = new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL)
    console.log('Redirecting to dashboard at:', redirectTarget.toString())

    return NextResponse.redirect(redirectTarget)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'OAuth token exchange failed' }, { status: 500 })
  }
}
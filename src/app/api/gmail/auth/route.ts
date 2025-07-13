import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_SITE_URL + '/api/gmail/callback'
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'openid',
      'email',
      'profile',
    ],
    prompt: 'select_account', // ✅ allows selecting account each time
  })

  return NextResponse.redirect(authUrl)
}
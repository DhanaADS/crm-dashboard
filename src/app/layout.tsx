// src/app/layout.tsx
'use client'

import './globals.css'
import { SessionProvider } from 'next-auth/react' // ✅ import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider> {/* ✅ wrap your app */}
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
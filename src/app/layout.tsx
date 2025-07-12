// src/app/layout.tsx
import '../styles/globals.css'
import { ReactNode } from 'react'
import ThemeProvider from '../components/ThemeProvider'

export const metadata = {
  title: 'CRM Dashboard',
  description: 'Built with Next.js + Tailwind',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

// ✅ Calendar widget import (make sure the component exists)
import CalendarWidget from '../components/CalendarWidget'

const allowedEmails = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

type EmailItem = {
  id: string
  subject: string
  snippet: string
  from: string
}

export default function HomePage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await supabase.auth.getSession()
        const session = response?.data?.session
        const email = session?.user?.email || ''

        if (!session || !session.user || !allowedEmails.includes(email)) {
          await supabase.auth.signOut()
          router.push('/login')
        } else {
          setAuthChecked(true)
        }
      } catch (err) {
        console.error('Auth Check Failed:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, supabase])

  const fetchInbox = async () => {
    try {
      setEmailStatus('loading')
      const res = await fetch('/api/emails')
      const data: { inbox?: EmailItem[] } = await res.json()

      if (Array.isArray(data.inbox) && data.inbox.length > 0) {
        setEmails(data.inbox)
        setEmailStatus('success')
      } else {
        setEmails([])
        setEmailStatus('success')
      }
    } catch (err) {
      console.error('Inbox fetch error:', err)
      setEmailStatus('error')
    }
  }

  useEffect(() => {
    if (authChecked) fetchInbox()
  }, [authChecked])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <main className="relative min-h-screen p-6 bg-gray-900 text-white">
        <p className="text-sm text-center">Checking authentication...</p>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen p-6 bg-gray-900 text-white">
      {/* 🔓 Logout Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded shadow"
        >
          🔓 Logout
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-10 mb-6">
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/assets/ads-logo.png"
            alt="ADS Logo"
            width={80}
            height={80}
            className="mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-center md:text-left">ADS Dashboard</h1>
        </div>
        <div className="mt-4 md:mt-0">
          <CalendarWidget />
        </div>
      </div>

      {/* Status Indicator */}
      {emailStatus === 'loading' && (
        <p className="text-sm text-yellow-400 mt-2 text-center">🔄 Fetching inbox preview...</p>
      )}
      {emailStatus === 'success' && emails.length === 0 && (
        <p className="text-sm text-gray-400 mt-2 text-center">📭 No new emails found.</p>
      )}
      {emailStatus === 'error' && (
        <div className="text-sm text-red-500 mt-2 text-center">
          ❌ Failed to fetch inbox.
          <button
            onClick={fetchInbox}
            className="ml-3 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* 📥 Inbox Preview – Modern UI */}
      {emails.length > 0 && (
        <div className="mt-6 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-3xl w-full mx-auto">
          <h2 className="text-xl font-semibold mb-4">📬 Inbox</h2>
          <ul className="space-y-4">
            {emails.map((email) => (
              <li
                key={email.id}
                className="bg-gray-800 hover:bg-gray-700 transition-all p-4 rounded-md shadow border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold truncate">{email.subject || '📭 (No Subject)'}</h3>
                  <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300">
                  <span className="text-blue-400 font-medium">{email.from}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {email.snippet || '(No body)'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
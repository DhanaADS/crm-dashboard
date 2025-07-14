'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import SkeletonCard from '@/components/SkeletonCard'
import AnalyticsChart from '@/components/AnalyticsChart'

const GmailAuthButton = dynamic(() => import('@/components/GmailAuthButton'), { ssr: false })

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

type IncomingEmail = {
  id: string
  from_email: string
  subject: string
  body: string
  received_at: string
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [incomingEmails, setIncomingEmails] = useState<IncomingEmail[]>([])
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
          setTimeout(() => setLoading(false), 1000)
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
    const res = await fetch('/api/gmail/preview')
    const data = await res.json()

    if (Array.isArray(data?.inbox) && data.inbox.length > 0) {
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
    if (!authChecked) return

    fetchInbox()

    const fetchIncomingEmails = async () => {
      const res = await fetch('/api/incoming-email/list')
      const json: { emails: IncomingEmail[] } = await res.json()
      setIncomingEmails(json.emails)
    }

    fetchIncomingEmails()
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
      <div className="flex flex-col items-center mt-10 mb-6">
        <Image
          src="/assets/ads-logo.png"
          alt="ADS Logo"
          width={80}
          height={80}
          className="mb-4 object-contain"
        />
        <h1 className="text-3xl font-bold text-center">ADS Dashboard</h1>

        <div className="mt-3">
          <GmailAuthButton />
        </div>

        {/* Status Indicator */}
        {emailStatus === 'loading' && (
          <p className="text-sm text-yellow-400 mt-2">🔄 Fetching inbox preview...</p>
        )}
        {emailStatus === 'success' && emails.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">📭 No new emails found.</p>
        )}
        {emailStatus === 'error' && (
          <div className="text-sm text-red-500 mt-2">
            ❌ Failed to fetch inbox.
            <button
              onClick={fetchInbox}
              className="ml-3 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* 📥 Inbox Preview */}
        {emails.length > 0 && (
          <div className="mt-6 bg-gray-800 text-white p-4 rounded shadow max-w-2xl w-full mx-auto">
            <h2 className="text-lg font-semibold mb-3">📥 Latest Emails</h2>
            <ul className="space-y-2 text-sm">
              {emails.map((email) => (
                <li key={email.id} className="border-b border-gray-700 pb-2">
                  <p className="font-medium">✉️ <strong>{email.subject}</strong></p>
                  <p className="text-xs text-gray-400">From: {email.from}</p>
                  <p className="text-xs text-gray-500">{email.snippet}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 📩 Stored Incoming Emails */}
        {incomingEmails.length > 0 && (
          <div className="mt-6 bg-gray-800 text-white p-4 rounded shadow max-w-2xl w-full mx-auto">
            <h2 className="text-lg font-semibold mb-3">🗂 Stored Emails</h2>
            <ul className="space-y-2 text-sm">
              {incomingEmails.map((email) => (
                <li key={email.id} className="border-b border-gray-700 pb-2">
                  <p className="font-medium">📨 <strong>{email.subject}</strong></p>
                  <p className="text-xs text-gray-400">From: {email.from_email}</p>
                  <p className="text-xs text-gray-500">{email.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-gray-800 p-4 rounded shadow">💡 Real Card 1</div>
            <div className="bg-gray-800 p-4 rounded shadow">📊 Real Card 2</div>
            <div className="bg-gray-800 p-4 rounded shadow">🚀 Real Card 3</div>
          </>
        )}
      </div>

      {/* Analytics */}
      <div className="mt-6 flex justify-end pr-4">
        <div className="w-[400px] bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-center mb-4 text-white">
            Analytics Overview
          </h2>
          <AnalyticsChart />
        </div>
      </div>
    </main>
  )
}
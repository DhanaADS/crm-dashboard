'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

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

      if (Array.isArray(data.inbox)) {
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
    <main className="relative min-h-screen bg-gray-900 text-white px-6 py-10">
      {/* Logout */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded shadow"
        >
          🔓 Logout
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-8">
        <Image
          src="/assets/ads-logo.png"
          alt="ADS Logo"
          width={60}
          height={60}
          className="object-contain"
        />
        <h1 className="text-2xl font-bold mt-2">ADS Dashboard</h1>
        <div className="flex space-x-4 mt-4">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">Gmail</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">WhatsApp</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">Telegram</button>
        </div>
      </div>

      {/* Email Table Filters */}
      <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto">
        <div className="text-sm">Showing emails for: <strong>Gmail</strong></div>
        <div>
          <select className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700">
            <option>All Filters</option>
            <option>Name</option>
            <option>ID</option>
            <option>Subject</option>
            <option>Body</option>
            <option>Date</option>
          </select>
        </div>
      </div>

      {/* Email Table */}
      <div className="overflow-auto rounded shadow border border-gray-800 max-w-5xl mx-auto bg-[#121212]">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left font-semibold">Select</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Subject</th>
              <th className="p-3 text-left font-semibold">Body</th>
              <th className="p-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {emailStatus === 'loading' && (
              <tr><td colSpan={6} className="text-center p-4">🔄 Loading emails...</td></tr>
            )}
            {emailStatus === 'error' && (
              <tr><td colSpan={6} className="text-center text-red-400 p-4">❌ Error loading inbox</td></tr>
            )}
            {emailStatus === 'success' && emails.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 p-4">📭 No emails found</td></tr>
            )}
            {emails.map((email) => (
              <tr key={email.id} className="border-t border-gray-800 hover:bg-gray-800">
                <td className="p-3"><input type="checkbox" className="form-checkbox" /></td>
                <td className="p-3">{email.from.split('<')[0].trim()}</td>
                <td className="p-3 text-xs text-gray-400">{email.id.slice(0, 8)}</td>
                <td className="p-3 font-medium">{email.subject || '(No Subject)'}</td>
                <td className="p-3 text-gray-300 truncate max-w-xs">{email.snippet || '(No body)'}</td>
                <td className="p-3 text-xs text-gray-400">{new Date().toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import EmailFilters from '@/components/EmailFilters'
import EmailTable from '@/components/EmailTable'

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
  const [activeTab, setActiveTab] = useState<'gmail' | 'whatsapp' | 'telegram' | null>(null)

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
    <main className="relative min-h-screen bg-gray-100 text-gray-900">
      {/* Logout Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded shadow"
        >
          🔓 Logout
        </button>
      </div>

      <section className="min-h-screen px-8 py-6">
        <div className="flex-1">
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

  {/* ✅ Official-colors-based interactive buttons */}
  <div className="flex gap-2 mt-3">
    <button
      onClick={() => {
        setActiveTab('gmail')
        fetchInbox()
      }}
      className={`text-sm font-semibold px-4 py-1.5 rounded shadow transition
        ${activeTab === 'gmail'
          ? 'bg-[#D93025] text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
      `}
    >
      Gmail
    </button>

    <button
      onClick={() => {
        setActiveTab('whatsapp')
        alert('WhatsApp integration coming soon 📱')
      }}
      className={`text-sm font-semibold px-4 py-1.5 rounded shadow transition
        ${activeTab === 'whatsapp'
          ? 'bg-[#25D366] text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
      `}
    >
      WhatsApp
    </button>

    <button
      onClick={() => {
        setActiveTab('telegram')
        alert('Telegram integration coming soon 💬')
      }}
      className={`text-sm font-semibold px-4 py-1.5 rounded shadow transition
        ${activeTab === 'telegram'
          ? 'bg-[#0088CC] text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
      `}
    >
      Telegram
    </button>
  </div>
</div>

          <EmailFilters />
          <EmailTable emails={emails} status={emailStatus} />
        </div>
      </section>
    </main>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import EmailFilters from '@/components/EmailFilters'
import EmailTable from '@/components/EmailTable'
import InventoryTable from '@/components/InventoryTable'
import { EmailItem } from '@/types/email'
import { InventoryItem } from '@/types/inventory'

const allowedEmails = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

export default function HomePage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [inventoryStatus, setInventoryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'gmail' | 'whatsapp' | 'telegram' | 'inventory' | null>(null)

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

  const fetchInventory = async () => {
    try {
      setInventoryStatus('loading')
      const { data, error } = await supabase.from('web_inventory').select('*')
      if (error) throw error
      setInventory(data || [])
      setInventoryStatus('success')
    } catch (err) {
      console.error('Inventory fetch error:', err)
      setInventoryStatus('error')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <main className="relative min-h-screen p-6 bg-transparent text-white">
        <p className="text-sm text-center">Checking authentication...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent text-white p-4 sm:p-6">
      <div className="absolute top-4 left-4 z-50">
        <button onClick={handleLogout} className="btn btn-outline">
          🔓 Logout
        </button>
      </div>

      <div className="card max-w-5xl mx-auto p-6 sm:p-8 mt-10 bg-white/5 text-white shadow-lg">
        <div className="flex flex-col items-center justify-center mb-6">
          <Image
            src="/assets/ads-logo.png"
            alt="ADS Logo"
            width={60}
            height={60}
            className="object-contain"
          />
         <h1 className="text-2xl font-bold mt-2 text-white">ADS Dashboard</h1>

          <div className="flex gap-3 mt-4 flex-wrap justify-center">
            <button
              onClick={() => {
                setActiveTab('gmail')
                fetchInbox()
              }}
              className="btn btn-primary"
            >
              Gmail
            </button>

            <button
              onClick={() => {
                setActiveTab('whatsapp')
                alert('WhatsApp integration coming soon 📱')
              }}
              className="btn btn-secondary"
            >
              WhatsApp
            </button>

            <button
              onClick={() => {
                setActiveTab('telegram')
                alert('Telegram integration coming soon 💬')
              }}
              className="btn btn-secondary"
            >
              Telegram
            </button>

            <button
              onClick={() => {
                setActiveTab('inventory')
                fetchInventory()
              }}
              className="btn btn-primary"
            >
              📦 Inventory
            </button>
          </div>
        </div>

        {/* Gmail Tab */}
        {activeTab === 'gmail' && (
          <>
            <EmailFilters source="Gmail" />
            <div className="card mt-4 p-4 sm:p-6 bg-white/5 text-white">
              <EmailTable emails={emails} status={emailStatus} onRefresh={fetchInbox} />
            </div>
          </>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="mt-6">
            <InventoryTable items={inventory} status={inventoryStatus} />
          </div>
        )}
      </div>
    </main>
  )
}
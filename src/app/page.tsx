'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import SkeletonCard from '@/components/SkeletonCard'
import DarkModeToggle from '@/components/DarkModeToggle'
import AnalyticsChart from '@/components/AnalyticsChart'

const allowedEmails = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const email = session?.user?.email || ''

      if (!session || !allowedEmails.includes(email)) {
        router.push('/login')
      } else {
        setAuthChecked(true)
        setTimeout(() => setLoading(false), 1000)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm">Checking authentication...</p>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen p-6">
      {/* 🔄 Dark Mode + Logout Row */}
      <div className="fixed top-4 right-6 z-50 flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded shadow"
        >
          🔓 Logout
        </button>
        <DarkModeToggle />
      </div>

      {/* ✅ Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">ADS Dashboard</h1>

      {/* Cards Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">💡 Real Card 1</div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">📊 Real Card 2</div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">🚀 Real Card 3</div>
          </>
        )}
      </div>

      {/* 📊 Analytics Section */}
      <div className="mt-6 flex justify-end pr-4">
        <div className="w-[400px] bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
            Analytics Overview
          </h2>
          <AnalyticsChart />
        </div>
      </div>
    </main>
  )
}
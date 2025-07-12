'use client'

import { useEffect, useState } from 'react'
import SkeletonCard from '@/components/SkeletonCard'
import DarkModeToggle from '@/components/DarkModeToggle'
import AnalyticsChart from '@/components/AnalyticsChart'

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="relative min-h-screen p-6">
      {/* ✅ Toggle Button at Top-Right */}
      <div className="fixed top-4 right-6 z-50">
        <DarkModeToggle />
      </div>

      {/* ✅ Page Title Centered */}
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


{/* 📊 Analytics Section - Right Aligned */}
<div className="mt-6 flex justify-end pr-4">
  <div className="w-[400px] bg-white dark:bg-gray-900 p-4 rounded shadow">
    <h2 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">Analytics Overview</h2>
    <AnalyticsChart />
  </div>
</div>
    </main>
  )
}
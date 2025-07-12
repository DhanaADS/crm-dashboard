'use client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={toggleDarkMode}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
      >
        {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      <h1 className="text-4xl font-bold mt-6">CRM Dashboard</h1>
    </div>
  )
}
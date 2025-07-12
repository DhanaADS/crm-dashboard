'use client'
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'light'
    setIsDark(stored === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    setIsDark(!isDark)
  }

  return (
    <button onClick={toggleTheme} className="border px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
      {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}
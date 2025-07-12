'use client'

import { useEffect, useState } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full transition duration-300 shadow-md"
    >
      {isDark ? (
        <>
          <FaMoon className="text-blue-400" />
          <span className="text-sm">Dark</span>
        </>
      ) : (
        <>
          <FaSun className="text-yellow-500" />
          <span className="text-sm">Light</span>
        </>
      )}
    </button>
  )
}
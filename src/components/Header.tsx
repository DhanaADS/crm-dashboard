'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function Header() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('ads-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('ads-theme', newTheme)
    document.documentElement.className = newTheme
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
      <h1 className="text-2xl font-bold dark:text-white">CRM Dashboard</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="gap-2"
      >
        {theme === 'dark' ? (
          <>
            <Sun className="h-5 w-5" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="h-5 w-5" />
            <span>Dark</span>
          </>
        )}
      </Button>
    </div>
  )
}
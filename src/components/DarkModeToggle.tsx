'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DarkModeToggle() {
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
  )
}
'use client'

import React, { useEffect } from 'react'
import { Button } from 'flowbite-react'
import { HiSun, HiMoon } from 'react-icons/hi2'
import { useThemeStore } from '@/store/store'
import type { Theme } from '@/store/slices/themeSlice'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      // Use setTheme instead of toggleTheme for initialization
      const { setTheme } = useThemeStore.getState()
      setTheme(savedTheme)
    }
  }, [])

  const isDark = theme === 'dark'

  return (
    <Button
      color="gray"
      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
      size="sm"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
    </Button>
  )
}

export default ThemeToggle

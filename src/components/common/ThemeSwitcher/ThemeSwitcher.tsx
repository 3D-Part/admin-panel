'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Button } from 'flowbite-react'
import {
  HiSun,
  HiMoon,
  HiComputerDesktop,
  HiChevronDown,
} from 'react-icons/hi2'
import { useThemeStore } from '@/store/store'
import type { Theme } from '@/store/slices/themeSlice'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <HiSun className="h-5 w-5" />
      case 'dark':
        return <HiMoon className="h-5 w-5" />
      case 'system':
        return <HiComputerDesktop className="h-5 w-5" />
      default:
        return <HiMoon className="h-5 w-5" />
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        color="gray"
        className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getThemeIcon()}
        <HiChevronDown
          className={`h-4 w-4 ml-1 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              Theme
            </div>
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                theme === 'light'
                  ? 'bg-cyan-50 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <HiSun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-cyan-50 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <HiMoon className="h-4 w-4" />
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                theme === 'system'
                  ? 'bg-cyan-50 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <HiComputerDesktop className="h-4 w-4" />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSwitcher

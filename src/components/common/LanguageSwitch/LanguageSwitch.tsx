'use client'

import React, { useEffect } from 'react'
import { Button } from 'flowbite-react'
import { readStoredLanguage, useLanguageStore } from '@/shared/i18n'

// Everything below is mounted again on a switch, so every text is redrawn
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { language, setLanguage } = useLanguageStore()

  useEffect(() => {
    setLanguage(readStoredLanguage())
  }, [setLanguage])

  return <React.Fragment key={language}>{children}</React.Fragment>
}

const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguageStore()

  return (
    <Button.Group>
      {(['en', 'sr'] as const).map((option) => (
        <Button
          key={option}
          size="xs"
          color={language === option ? 'purple' : 'gray'}
          onClick={() => setLanguage(option)}
        >
          {option.toUpperCase()}
        </Button>
      ))}
    </Button.Group>
  )
}

export default LanguageSwitch

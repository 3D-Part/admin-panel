'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

type InlineTextType = {
  label: string
  value?: string | null
  editable?: boolean
  className?: string
  onSave: (value: string) => Promise<boolean>
}

// Saves when the field loses focus or on Enter, and goes back on a failed save
const InlineText: React.FC<InlineTextType> = ({
  label,
  value,
  editable = true,
  className = 'w-full',
  onSave,
}) => {
  const initial = value ?? ''
  const [text, setText] = useState(initial)
  const [saved, setSaved] = useState(initial)

  useEffect(() => {
    setText(initial)
    setSaved(initial)
  }, [initial])

  if (!editable) return <span>{initial || '—'}</span>

  const commit = async () => {
    if (text.trim() === saved.trim()) return
    if (!text.trim()) {
      setText(saved)
      return
    }
    if (await onSave(text.trim())) {
      setSaved(text.trim())
      toast(`${label} saved`, { type: 'success', autoClose: 1500 })
    } else {
      setText(saved)
    }
  }

  return (
    <input
      aria-label={label}
      title={text}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      onClick={(e) => e.stopPropagation()}
      className={`${className} px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
    />
  )
}

export default InlineText

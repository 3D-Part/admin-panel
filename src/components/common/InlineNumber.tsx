'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

type InlineNumberType = {
  label: string
  value?: number | string | null
  whole?: boolean
  editable?: boolean
  placeholder?: string
  onSave: (value: number | null) => Promise<boolean>
}

// Saves when the field loses focus or on Enter, and goes back on a failed save
const InlineNumber: React.FC<InlineNumberType> = ({
  label,
  value,
  whole = false,
  editable = true,
  placeholder = '—',
  onSave,
}) => {
  const initial = value === null || value === undefined ? '' : String(value)
  const [text, setText] = useState(initial)
  const [saved, setSaved] = useState(initial)

  useEffect(() => {
    setText(initial)
    setSaved(initial)
  }, [initial])

  if (!editable) return <span>{initial || placeholder}</span>

  const commit = async () => {
    if (text.trim() === saved.trim()) return

    const parsed = text.trim() === '' ? null : Number(text.replace(',', '.'))
    const invalid =
      parsed !== null &&
      (!Number.isFinite(parsed) ||
        parsed < 0 ||
        (whole && !Number.isInteger(parsed)))
    if (invalid || (parsed === null && whole)) {
      toast('Enter a valid number', { type: 'error', autoClose: 2000 })
      setText(saved)
      return
    }

    if (await onSave(parsed)) {
      setSaved(text)
      toast(`${label} saved`, { type: 'success', autoClose: 1500 })
    } else {
      setText(saved)
    }
  }

  return (
    <input
      aria-label={label}
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-20 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    />
  )
}

export default InlineNumber

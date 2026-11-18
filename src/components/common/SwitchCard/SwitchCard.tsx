'use client'

import React, { useId } from 'react'

/**
 * A setting that is on or off, as a card: a title, a short explanation and a
 * large switch. The whole card is clickable; `children` can show what the
 * setting changes.
 */
const SwitchCard: React.FC<{
  title: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
}> = ({ title, description, checked, onChange, disabled, children }) => {
  const id = useId()

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        checked
          ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
          <span className="block text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </span>
          {description && (
            <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
              {description}
            </span>
          )}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default SwitchCard

'use client'
import React from 'react'
import { HiBan } from 'react-icons/hi'
import { tx } from '@/shared/i18n'
import { SALE_COLORS } from '@/shared/helpers/saleTags'

export const HEX_COLOR = /^#[0-9a-f]{6}$/i

/**
 * One of the 10 colors of the palette, any other with the picker, and, when
 * `allowNone`, no color at all (null).
 */
const ColorChoice: React.FC<{
  value: string | null
  onChange: (color: string | null) => void
  allowNone?: boolean
  size?: 'sm' | 'md'
}> = ({ value, onChange, allowNone = false, size = 'md' }) => {
  const current = value?.toLowerCase() ?? null
  const dot = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const ring = 'border-gray-900 ring-2 ring-offset-2 ring-gray-400 dark:border-white dark:ring-offset-gray-800'
  const custom = current !== null && !SALE_COLORS.includes(current)
  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowNone && (
        <button
          type="button"
          title={tx('None')}
          aria-label={tx('None')}
          aria-pressed={current === null}
          onClick={() => onChange(null)}
          className={`flex ${dot} items-center justify-center rounded-full border-2 bg-white text-gray-400 transition dark:bg-gray-700 ${
            current === null ? ring : 'border-gray-300 hover:scale-110 dark:border-gray-600'
          }`}
        >
          <HiBan className="h-4 w-4" />
        </button>
      )}
      {SALE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          aria-label={color}
          aria-pressed={current === color}
          onClick={() => onChange(color)}
          className={`${dot} rounded-full border-2 transition ${
            current === color ? ring : 'border-transparent hover:scale-110'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <label
        className={`flex items-center gap-2 rounded px-1 text-sm text-gray-600 dark:text-gray-300 ${
          custom ? 'ring-2 ring-gray-400' : ''
        }`}
        title={tx('Any other color')}
      >
        <input
          type="color"
          value={current && HEX_COLOR.test(current) ? current : '#9ca3af'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5 dark:border-gray-600"
        />
        {tx('Other')}
      </label>
    </div>
  )
}

export default ColorChoice

'use client'
import React from 'react'
import { Label } from 'flowbite-react'
import { tx } from '@/shared/i18n'
import { SALE_COLORS } from '@/shared/helpers/saleTags'

/**
 * The sale's own color: one of the palette, or any other with the picker.
 * Products on the sale are marked with it everywhere in the admin.
 */
const SaleColorPicker: React.FC<{
  value: string
  onChange: (color: string) => void
  // colors other sales already have, marked so a new one can differ
  taken?: string[]
}> = ({ value, onChange, taken = [] }) => {
  const current = value.toLowerCase()
  const used = new Set(taken.map((color) => color.toLowerCase()))
  return (
    <div>
      <Label
        value={tx('Sale color')}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
      />
      <div className="flex flex-wrap items-center gap-2">
        {SALE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={used.has(color) ? tx('Another sale has this color') : color}
            aria-label={color}
            aria-pressed={current === color}
            onClick={() => onChange(color)}
            className={`relative h-8 w-8 rounded-full border-2 transition ${
              current === color
                ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400 dark:border-white dark:ring-offset-gray-800'
                : 'border-transparent hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
          >
            {used.has(color) && current !== color && (
              <span className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-white/80" />
            )}
          </button>
        ))}
        <label
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
          title={tx('Any other color')}
        >
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#9ca3af'}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5 dark:border-gray-600"
          />
          {tx('Other')}
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {tx('Products on this sale are marked with this color in the admin.')}
      </p>
    </div>
  )
}

export default SaleColorPicker

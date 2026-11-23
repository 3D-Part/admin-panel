'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Dropdown } from 'flowbite-react'
import { HiFlag, HiOutlineFlag } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import {
  CUSTOMER_FLAG_COLORS,
  CustomerFlagType,
  useProductFlagTypes,
} from '@/shared/helpers/customerFlags'

/**
 * Product flags: a pool of flags (name and color) kept in the settings, which
 * the staff put on products, e.g. "check the price". The shop never sees them.
 */

const colorOf = (type?: CustomerFlagType) =>
  (type ? CUSTOMER_FLAG_COLORS[type.color] : null) ?? CUSTOMER_FLAG_COLORS.gray

// Saving the flags of a product bumps this, so every open list loads them again
let version = 0
const listeners = new Set<() => void>()
const flagsChanged = () => {
  version++
  listeners.forEach((listener) => listener())
}

/** The flags of each of the products, by product id. */
export const useProductFlags = (ids: string[]) => {
  const [flags, setFlags] = useState<Record<string, string[]>>({})
  const [seen, setSeen] = useState(version)
  const key = Array.from(new Set(ids.filter(Boolean))).sort().join(',')

  useEffect(() => {
    const listener = () => setSeen(version)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!key) return
    BackofficeAPI.getProductFlags(key.split(',')).then((data) => {
      if (data) setFlags(data)
    })
  }, [key, seen])

  return flags
}

/** The flags of a product: a flag in its color, with the name unless `compact`. */
export const ProductFlagBadges: React.FC<{ flags?: string[]; compact?: boolean }> = ({
  flags = [],
  compact = false,
}) => {
  const types = useProductFlagTypes()
  if (flags.length === 0) return null
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {flags.map((flag) => {
        const type = types.find((item) => item.id === flag)
        const label = type?.label ?? tx('Removed flag ({flag})', { flag })
        return (
          <span
            key={flag}
            title={label}
            className={`inline-flex items-center gap-1 text-xs font-semibold ${colorOf(type).text}`}
          >
            <HiFlag className="h-3.5 w-3.5 shrink-0" aria-label={label} />
            {!compact && label}
          </span>
        )
      })}
    </span>
  )
}

/** Puts flags on a product or takes them off; saved right away. */
export const ProductFlagPicker: React.FC<{
  productId: string
  flags: string[]
  onSaved?: (flags: string[]) => void
  // a small flag button with a menu (e.g. in a table) instead of the list of flags
  compact?: boolean
  disabled?: boolean
}> = ({ productId, flags, onSaved, compact = false, disabled = false }) => {
  const types = useProductFlagTypes()
  const [current, setCurrent] = useState(flags)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCurrent(flags)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags.join(',')])

  const toggle = async (id: string) => {
    if (disabled || saving) return
    const next = current.includes(id) ? current.filter((flag) => flag !== id) : [...current, id]
    setSaving(true)
    setCurrent(next)
    const saved = await BackofficeAPI.setProductFlags(productId, next)
    setSaving(false)
    if (!saved) {
      setCurrent(current)
      toast(tx('Could not save'), { type: 'error', autoClose: 2000 })
      return
    }
    setCurrent(saved.flags)
    onSaved?.(saved.flags)
    flagsChanged()
  }

  if (types.length === 0) {
    return compact ? null : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tx('No product flags yet. Add them in Settings → Product flags.')}
      </p>
    )
  }

  if (compact) {
    return (
      <Dropdown
        inline
        dismissOnClick={false}
        disabled={disabled}
        arrowIcon={false}
        label={
          <span
            title={tx('Product flags')}
            aria-label={tx('Product flags')}
            className="inline-flex items-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <HiOutlineFlag className="h-4 w-4" />
          </span>
        }
      >
        <Dropdown.Header>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {tx('Product flags')}
          </span>
        </Dropdown.Header>
        {types.map((type) => (
          <Dropdown.Item key={type.id} onClick={() => toggle(type.id)}>
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                readOnly
                checked={current.includes(type.id)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <HiFlag className={`h-4 w-4 ${colorOf(type).text}`} />
              {type.label}
            </span>
          </Dropdown.Item>
        ))}
      </Dropdown>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => {
        const on = current.includes(type.id)
        return (
          <button
            key={type.id}
            type="button"
            disabled={disabled || saving}
            aria-pressed={on}
            onClick={() => toggle(type.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition ${
              on
                ? 'border-gray-900 bg-gray-100 text-gray-900 dark:border-white dark:bg-gray-700 dark:text-white'
                : 'border-gray-300 text-gray-500 hover:border-gray-500 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            <HiFlag className={`h-4 w-4 ${on ? colorOf(type).text : ''}`} />
            {type.label}
          </button>
        )
      })}
    </div>
  )
}

/** The flags of one product with the picker, for the product page. */
export const ProductFlagsBox: React.FC<{ productId?: string; disabled?: boolean }> = ({
  productId,
  disabled,
}) => {
  const flags = useProductFlags(productId ? [productId] : [])[productId ?? ''] ?? []
  if (!productId) return null
  return (
    <div className="w-full">
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {tx('Product flags (staff only)')}
      </p>
      <ProductFlagPicker productId={productId} flags={flags} disabled={disabled} />
    </div>
  )
}

'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Label, Select } from 'flowbite-react'
import { HiBookmark } from 'react-icons/hi2'
import { toast } from 'react-toastify'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import { CUSTOMER_FLAG_COLORS, useOrderFlagTypes } from '@/shared/helpers/customerFlags'

/**
 * The flag of an order (urgent, waiting for payment...) next to the order: a
 * bookmark in the flag's color and its name. An order without one shows
 * nothing. A bookmark, so it is not mixed up with the customer's flag.
 */
export const OrderFlagBadge: React.FC<{ flag?: string | null }> = ({ flag }) => {
  const types = useOrderFlagTypes()
  if (!flag) return null
  const type = types.find((item) => item.id === flag)
  const color = (type ? CUSTOMER_FLAG_COLORS[type.color] : null) ?? CUSTOMER_FLAG_COLORS.gray
  const label = type?.label ?? tx('Removed flag ({flag})', { flag })
  return (
    <span title={label} className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${color.text}`}>
      <HiBookmark className="h-4 w-4" aria-hidden />
      {label}
    </span>
  )
}

/** Picks the flag of an order; saved right away. */
export const OrderFlagPicker: React.FC<{
  order: Order
  disabled?: boolean
  onSaved: (flag: string | null) => void
}> = ({ order, disabled, onSaved }) => {
  const types = useOrderFlagTypes()
  const [saving, setSaving] = useState(false)
  const current = order.flag ?? ''

  const change = async (value: string) => {
    setSaving(true)
    const ok = await OrdersAPI.orderSetFlag(order.id, value || null)
    setSaving(false)
    if (!ok) {
      toast(tx('Could not save'), { type: 'error', autoClose: 2000 })
      return
    }
    onSaved(value || null)
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <Label htmlFor="order-flag" value={tx('Order flag (staff only)')} />
      <div className="mt-1 flex items-center gap-3">
        <Select
          id="order-flag"
          className="flex-1"
          value={current}
          disabled={disabled || saving}
          onChange={(e) => change(e.target.value)}
        >
          <option value="">{tx('No flag')}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
          {current && !types.some((type) => type.id === current) && (
            <option value={current}>{tx('Removed flag ({flag})', { flag: current })}</option>
          )}
        </Select>
        <OrderFlagBadge flag={current} />
      </div>
    </div>
  )
}

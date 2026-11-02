'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import { BILLING_COLORS, BillingOption } from '@/shared/helpers/billingOptions'

const BillingSelect: React.FC<{
  order: Order
  options: BillingOption[]
  disabled?: boolean
}> = ({ order, options, disabled }) => {
  const [value, setValue] = useState(order.billingStatus ?? '')

  useEffect(() => {
    setValue(order.billingStatus ?? '')
  }, [order.billingStatus])

  const change = async (next: string) => {
    const previous = value
    setValue(next)
    const saved = await OrdersAPI.orderSetBilling(order.id, next || null)
    if (!saved) {
      setValue(previous)
      toast('The invoice status was not saved', { type: 'error', autoClose: 2000 })
    }
  }

  const current = options.find((option) => option.id === value)
  // an option removed from Settings still shows on the orders that have it
  const missing = value && !current

  return (
    <select
      aria-label={`Invoice status of order ${order.orderNumber}`}
      disabled={disabled}
      value={value}
      onChange={(e) => change(e.target.value)}
      className={`w-36 rounded-lg border-0 py-1 pl-2 pr-7 text-xs font-medium ${
        current
          ? BILLING_COLORS[current.color] ?? BILLING_COLORS.gray
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      <option value="">—</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
      {missing && <option value={value}>{value}</option>}
    </select>
  )
}

export default BillingSelect

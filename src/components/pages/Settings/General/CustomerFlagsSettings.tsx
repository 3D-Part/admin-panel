'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, TextInput } from 'flowbite-react'
import { HiFlag } from 'react-icons/hi'
import { HiArrowDown, HiArrowUp, HiTrash } from 'react-icons/hi2'
import { BackofficeAPI } from '@/services'
import {
  CUSTOMER_FLAG_COLORS,
  CustomerFlagColor,
  CustomerFlagType,
  flagIdFromLabel,
} from '@/shared/helpers/customerFlags'

/** Why the list cannot be saved, or null. */
export const customerFlagsProblem = (flags: CustomerFlagType[], forOrders = false) => {
  const names = flags.map((flag) => flag.label.trim().toLowerCase())
  if (names.some((name) => !name))
    return forOrders ? 'Every order flag needs a name.' : 'Every customer status needs a name.'
  if (names.some((name, i) => names.indexOf(name) !== i))
    return forOrders ? 'Two order flags have the same name.' : 'Two customer statuses have the same name.'
  return null
}

/**
 * The customer statuses: name and color, in the order the staff pick from.
 * A status that customers have cannot be removed until they are moved to
 * another one, so no customer loses their flag without notice.
 */
const CustomerFlagsSettings: React.FC<{
  value: CustomerFlagType[]
  onChange: (next: CustomerFlagType[]) => void
  // the same editor serves the order flags; on an order red is only a color
  kind?: 'customer' | 'order'
}> = ({ value, onChange, kind = 'customer' }) => {
  const [usage, setUsage] = useState<Record<string, number>>({})
  const forOrders = kind === 'order'

  useEffect(() => {
    ;(forOrders ? BackofficeAPI.getOrderFlagUsage() : BackofficeAPI.getCustomerFlagUsage()).then(
      (data) => setUsage(data ?? {})
    )
  }, [forOrders])

  const update = (index: number, patch: Partial<CustomerFlagType>) =>
    onChange(value.map((flag, i) => (i === index ? { ...flag, ...patch } : flag)))

  const move = (index: number, by: number) => {
    const next = [...value]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    onChange(next)
  }

  const add = (color: CustomerFlagColor) => {
    const label = forOrders ? tx('New flag') : tx('New status')
    onChange([
      ...value,
      { id: flagIdFromLabel(`${label} ${value.length + 1}`, value.map((flag) => flag.id)), label, color },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {value.map((flag, index) => {
          const used = usage[flag.id] ?? 0
          const color = CUSTOMER_FLAG_COLORS[flag.color] ?? CUSTOMER_FLAG_COLORS.gray
          return (
            <div
              key={flag.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 md:flex-row md:items-center"
            >
              <HiFlag className={`hidden h-5 w-5 shrink-0 md:block ${color.text}`} />
              <TextInput
                className="md:w-72"
                sizing="sm"
                maxLength={60}
                value={flag.label}
                placeholder={tx('Name')}
                onChange={(e) => update(index, { label: e.target.value })}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {(Object.keys(CUSTOMER_FLAG_COLORS) as CustomerFlagColor[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    title={tx(CUSTOMER_FLAG_COLORS[key].label)}
                    onClick={() => update(index, { color: key })}
                    className={`h-6 w-6 rounded-full ${CUSTOMER_FLAG_COLORS[key].dot} ${
                      flag.color === key
                        ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-1 items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {!forOrders && flag.color === 'red' && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    {tx('Disputed')}
                  </span>
                )}
                <span>
                  {used > 0
                    ? forOrders
                      ? tx('Orders: {count}', { count: used })
                      : tx('Customers: {count}', { count: used })
                    : tx('Not used')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="xs" color="gray" disabled={index === 0} onClick={() => move(index, -1)}>
                  <HiArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  color="gray"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <HiArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  color="failure"
                  disabled={used > 0}
                  title={
                    used > 0
                      ? forOrders
                        ? tx('Orders have this flag. Give them another one first.')
                        : tx('Customers have this status. Give them another one first.')
                      : tx('Remove')
                  }
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {value.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {forOrders ? tx('No order flags.') : tx('No customer statuses. Every customer is neutral.')}
          </p>
        )}
      </div>

      {forOrders ? (
        <Button size="sm" color="gray" onClick={() => add('blue')}>
          <HiFlag className={`mr-1 h-4 w-4 ${CUSTOMER_FLAG_COLORS.blue.text}`} /> {tx('Add a flag')}
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" color="gray" onClick={() => add('green')}>
            <HiFlag className={`mr-1 h-4 w-4 ${CUSTOMER_FLAG_COLORS.green.text}`} /> {tx('Add a good status')}
          </Button>
          <Button size="sm" color="gray" onClick={() => add('orange')}>
            <HiFlag className={`mr-1 h-4 w-4 ${CUSTOMER_FLAG_COLORS.orange.text}`} /> {tx('Add a warning')}
          </Button>
          <Button size="sm" color="gray" onClick={() => add('red')}>
            <HiFlag className={`mr-1 h-4 w-4 ${CUSTOMER_FLAG_COLORS.red.text}`} /> {tx('Add a disputed reason')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CustomerFlagsSettings

'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Button, Select, TextInput } from 'flowbite-react'
import { HiArrowDown, HiArrowUp, HiCheck, HiTrash } from 'react-icons/hi'
import {
  BILLING_DOTS,
  BillingOption,
  billingDot,
  statusOf,
} from '@/shared/helpers/billingOptions'
import { ORDER_STATUS_FLOW } from '@/shared/enums'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'

const COLOR_NAMES: Record<string, string> = {
  brown: 'Brown',
  lightGreen: 'Light green',
  green: 'Green',
  blue: 'Blue',
  yellow: 'Yellow',
  pink: 'Pink',
  orange: 'Orange',
  red: 'Red',
  purple: 'Purple',
  teal: 'Teal',
  gray: 'Gray',
  white: 'White',
}

/**
 * The invoice steps an order can tick in the Orders list. Each step gets a
 * name and a color; the order here is the order of the circles.
 */
const BillingOptions: React.FC<{
  value: BillingOption[]
  onChange: (value: BillingOption[]) => void
}> = ({ value, onChange }) => {
  const change = (id: string, changes: Partial<BillingOption>) =>
    onChange(
      value.map((option) => (option.id === id ? { ...option, ...changes } : option))
    )

  const move = (index: number, by: number) => {
    const next = [...value]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {value.map((option, index) => (
        <div
          key={option.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <span
            aria-hidden
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              option.color === 'white' ? 'text-gray-900' : 'text-white'
            } ${
              billingDot(option.color).fill
            }`}
          >
            <HiCheck className="h-4 w-4" />
          </span>
          <TextInput
            aria-label={tx('Name')}
            className="flex-1 min-w-[10rem]"
            value={option.label}
            placeholder={tx('Name')}
            onChange={(e) => change(option.id, { label: e.target.value })}
          />
          <Select
            aria-label={`${tx('Changes the status to')}: ${option.label}`}
            title={tx('Changes the status to')}
            className="min-w-[11rem]"
            value={statusOf(option) ?? ''}
            onChange={(e) => change(option.id, { status: e.target.value || null })}
          >
            <option value="">{tx('Does not change the status')}</option>
            {ORDER_STATUS_FLOW.map((status) => (
              <option key={status} value={status}>
                → {getOrderStatusLabel(status)}
              </option>
            ))}
          </Select>
          <div
            role="radiogroup"
            aria-label={`${tx('Color')}: ${option.label}`}
            className="flex flex-wrap gap-1.5"
          >
            {Object.keys(BILLING_DOTS).map((color) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={option.color === color}
                aria-label={tx(COLOR_NAMES[color])}
                title={tx(COLOR_NAMES[color])}
                onClick={() => change(option.id, { color })}
                className={`h-6 w-6 rounded-full border-2 ${BILLING_DOTS[color].fill} ${
                  option.color === color
                    ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800'
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button
              size="xs"
              color="gray"
              aria-label={`${tx('Move up')}: ${option.label}`}
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <HiArrowUp />
            </Button>
            <Button
              size="xs"
              color="gray"
              aria-label={`${tx('Move down')}: ${option.label}`}
              disabled={index === value.length - 1}
              onClick={() => move(index, 1)}
            >
              <HiArrowDown />
            </Button>
            <Button
              size="xs"
              color="failure"
              aria-label={`${tx('Remove')}: ${option.label}`}
              onClick={() => onChange(value.filter((x) => x.id !== option.id))}
            >
              <HiTrash />
            </Button>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        color="gray"
        onClick={() =>
          onChange([
            ...value,
            { id: `custom-${Date.now()}`, label: '', color: 'blue', status: null },
          ])
        }
      >
        {tx('Add status')}
      </Button>
    </div>
  )
}

export default BillingOptions

'use client'

import React from 'react'
import { Button, Select, TextInput } from 'flowbite-react'
import { HiTrash } from 'react-icons/hi'
import { BILLING_COLORS, BillingOption } from '@/shared/helpers/billingOptions'

const COLOR_NAMES: Record<string, string> = {
  brown: 'Brown',
  lightGreen: 'Light green',
  green: 'Green',
  blue: 'Blue',
  yellow: 'Yellow',
  pink: 'Pink',
  orange: 'Orange',
  gray: 'Gray',
}

const BillingOptions: React.FC<{
  value: BillingOption[]
  onChange: (value: BillingOption[]) => void
}> = ({ value, onChange }) => {
  const change = (id: string, changes: Partial<BillingOption>) =>
    onChange(
      value.map((option) => (option.id === id ? { ...option, ...changes } : option))
    )

  return (
    <div className="space-y-3">
      {value.map((option) => (
        <div key={option.id} className="flex flex-wrap items-center gap-2">
          <TextInput
            aria-label="Name"
            className="flex-1 min-w-[10rem]"
            value={option.label}
            onChange={(e) => change(option.id, { label: e.target.value })}
          />
          <Select
            aria-label={`Color of ${option.label}`}
            value={option.color}
            onChange={(e) => change(option.id, { color: e.target.value })}
          >
            {Object.keys(BILLING_COLORS).map((color) => (
              <option key={color} value={color}>
                {COLOR_NAMES[color]}
              </option>
            ))}
          </Select>
          <span
            className={`rounded-lg px-3 py-1 text-xs font-medium ${BILLING_COLORS[option.color]}`}
          >
            {option.label || 'Preview'}
          </span>
          <Button
            size="xs"
            color="failure"
            aria-label={`Remove ${option.label}`}
            onClick={() => onChange(value.filter((x) => x.id !== option.id))}
          >
            <HiTrash />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        color="gray"
        onClick={() =>
          onChange([
            ...value,
            { id: `custom-${Date.now()}`, label: '', color: 'gray' },
          ])
        }
      >
        Add status
      </Button>
    </div>
  )
}

export default BillingOptions

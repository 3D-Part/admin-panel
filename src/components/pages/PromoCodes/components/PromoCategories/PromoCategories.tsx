'use client'

import React, { useEffect, useState } from 'react'
import { Checkbox, Label, TextInput } from 'flowbite-react'
import { useCategoryStore } from '@/store/store'

const PromoCategories: React.FC<{
  value: string[]
  onChange: (value: string[]) => void
}> = ({ value, onChange }) => {
  const { fetchAllCategories, allCategories } = useCategoryStore()
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchAllCategories()
  }, [fetchAllCategories])

  const visible = allCategories.filter((category) =>
    category.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Valid for categories ({value.length === 0 ? 'all' : value.length})
      </p>
      <TextInput
        placeholder="Filter categories"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded">
        {visible.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <Checkbox
              id={`promo-category-${category.id}`}
              checked={value.includes(category.id)}
              onChange={() =>
                onChange(
                  value.includes(category.id)
                    ? value.filter((id) => id !== category.id)
                    : [...value, category.id]
                )
              }
            />
            <Label
              htmlFor={`promo-category-${category.id}`}
              value={category.name}
            />
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Leave everything unticked for the whole shop. A category includes its
        subcategories.
      </p>
    </div>
  )
}

export default PromoCategories

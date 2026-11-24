'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useMemo } from 'react'
import { Button, Label, Select, TextInput } from 'flowbite-react'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { useCategoryStore } from '@/store/store'
import { TierCategoryRow } from '@/shared/helpers/tiers'

/**
 * The categories one tier gives its discount on, each with its own percent.
 * Without any the tier gives its discount on every product.
 */
const TierCategories: React.FC<{
  tierId: string
  value: TierCategoryRow[]
  defaultDiscount: string
  onChange: (value: TierCategoryRow[]) => void
}> = ({ tierId, value, defaultDiscount, onChange }) => {
  const { fetchAllCategories, allCategories } = useCategoryStore()

  useEffect(() => {
    fetchAllCategories()
  }, [fetchAllCategories])

  // "Parent › Child" so two subcategories with the same name can be told apart
  const options = useMemo(() => {
    const byId = new Map(allCategories.map((category) => [category.id, category]))
    const path = (id: string) => {
      const names: string[] = []
      const seen = new Set<string>()
      for (let current = byId.get(id); current && !seen.has(current.id); current = current.parentCategoryId ? byId.get(current.parentCategoryId) : undefined) {
        seen.add(current.id)
        names.unshift(current.name)
      }
      return names.join(' › ')
    }
    return allCategories
      .map((category) => ({ id: category.id, label: path(category.id) }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [allCategories])

  const update = (index: number, patch: Partial<TierCategoryRow>) =>
    onChange(value.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)))

  return (
    <div className="mt-3">
      <Label value={tx('Categories')} />
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {value.length === 0
          ? tx('The tier discount is given on every product. Add categories to give it only on them, each with its own discount.')
          : tx('The tier gives a discount only on these categories and their subcategories, each with its own discount; other products get none. A subcategory with its own row gets its own discount. The discount above then only ranks the tier.')}
      </p>
      <div className="space-y-2">
        {value.map((rule, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_8rem_auto]">
            <Select
              className="col-span-2 sm:col-span-1"
              id={`tier-category-${tierId}-${index}`}
              aria-label={tx('Category')}
              value={rule.categoryId}
              onChange={(e) => update(index, { categoryId: e.target.value })}
            >
              <option value="">{tx('Pick a category')}</option>
              {options.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  disabled={option.id !== rule.categoryId && value.some((other) => other.categoryId === option.id)}
                >
                  {option.label}
                </option>
              ))}
            </Select>
            <TextInput
              id={`tier-category-discount-${tierId}-${index}`}
              aria-label={tx('Discount (%)')}
              type="number"
              min="0"
              max="100"
              addon="%"
              value={rule.discount}
              onChange={(e) => update(index, { discount: e.target.value })}
            />
            <Button
              color="gray"
              size="sm"
              aria-label={tx('Remove category')}
              title={tx('Remove category')}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <HiTrash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        color="light"
        size="xs"
        className="mt-2"
        onClick={() => onChange([...value, { categoryId: '', discount: defaultDiscount }])}
      >
        <HiPlus className="mr-1 h-3 w-3" />
        {tx('Add category')}
      </Button>
    </div>
  )
}

export default TierCategories

'use client'

import React, { useRef } from 'react'
import { Dropdown } from 'flowbite-react'
import { HiSortDescending } from 'react-icons/hi'
import { useProductsStore } from '@/store/store'

type SortOption = {
  label: string
  field: string
  order: 'ASC' | 'DESC'
}

const sortOptions: SortOption[] = [
  { label: 'Newest first', field: 'createdAt', order: 'DESC' },
  { label: 'Oldest first', field: 'createdAt', order: 'ASC' },
  { label: 'Name A-Z', field: 'name', order: 'ASC' },
  { label: 'Name Z-A', field: 'name', order: 'DESC' },
  { label: 'Price: Low to High', field: 'price', order: 'ASC' },
  { label: 'Price: High to Low', field: 'price', order: 'DESC' },
  { label: 'Quantity: Low to High', field: 'quantity', order: 'ASC' },
  { label: 'Quantity: High to Low', field: 'quantity', order: 'DESC' },
  // { label: 'SKU A-Z', field: 'sku', order: 'ASC' },
  // { label: 'SKU Z-A', field: 'sku', order: 'DESC' },
]

const ProductsSort = () => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { sortFiled, sortOrder, setSortField, changeCurrentPage } =
    useProductsStore()

  const currentSort = sortOptions.find(
    (opt) => opt.field === sortFiled && opt.order === sortOrder
  )

  const handleSortChange = (option: SortOption) => {
    // Click the dropdown button to close it
    const button = dropdownRef.current?.querySelector('button')
    button?.click()

    setSortField(option.field, option.order)
    changeCurrentPage(1)
  }

  return (
    <div ref={dropdownRef}>
      <Dropdown
        label={
          <div className="flex items-center gap-2">
            <HiSortDescending className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">
              {currentSort?.label || 'Sort'}
            </span>
          </div>
        }
        size="sm"
      >
        {sortOptions.map((option) => (
          <Dropdown.Item
            key={`${option.field}-${option.order}`}
            onClick={() => handleSortChange(option)}
            className={
              sortFiled === option.field && sortOrder === option.order
                ? 'bg-gray-100 dark:bg-gray-700'
                : ''
            }
          >
            <span
              className={`font-medium ${
                sortFiled === option.field && sortOrder === option.order
                  ? 'text-cyan-600 dark:text-cyan-500'
                  : ''
              }`}
            >
              {option.label}
            </span>
          </Dropdown.Item>
        ))}
      </Dropdown>
    </div>
  )
}

export default ProductsSort

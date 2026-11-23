'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Dropdown } from 'flowbite-react'
import { HiFlag, HiOutlineFlag } from 'react-icons/hi'
import { useProductsStore } from '@/store/store'
import { CUSTOMER_FLAG_COLORS, useProductFlagTypes } from '@/shared/helpers/customerFlags'

/** Only the products with any of the chosen product flags. */
const ProductsFlagFilter = () => {
  const types = useProductFlagTypes()
  const { productFlagFilter, changeProductFlagFilter } = useProductsStore()
  if (types.length === 0) return null

  const toggle = (id: string) =>
    changeProductFlagFilter(
      productFlagFilter.includes(id)
        ? productFlagFilter.filter((flag) => flag !== id)
        : [...productFlagFilter, id]
    )

  const chosen = types.filter((type) => productFlagFilter.includes(type.id))

  return (
    <Dropdown
      dismissOnClick={false}
      size="sm"
      color={chosen.length ? 'purple' : 'gray'}
      label={
        <span className="flex items-center gap-2 whitespace-nowrap">
          {chosen.length ? <HiFlag className="h-4 w-4" /> : <HiOutlineFlag className="h-4 w-4" />}
          <span className="hidden sm:inline text-sm">
            {chosen.length === 1
              ? chosen[0].label
              : chosen.length > 1
              ? tx('{count} flags', { count: chosen.length })
              : tx('Flags')}
          </span>
        </span>
      }
    >
      {types.map((type) => (
        <Dropdown.Item key={type.id} onClick={() => toggle(type.id)}>
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              readOnly
              checked={productFlagFilter.includes(type.id)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <HiFlag className={`h-4 w-4 ${(CUSTOMER_FLAG_COLORS[type.color] ?? CUSTOMER_FLAG_COLORS.gray).text}`} />
            {type.label}
          </span>
        </Dropdown.Item>
      ))}
      {chosen.length > 0 && (
        <>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => changeProductFlagFilter([])}>
            {tx('Show all products')}
          </Dropdown.Item>
        </>
      )}
    </Dropdown>
  )
}

export default ProductsFlagFilter

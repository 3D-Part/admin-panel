'use client'
import React from 'react'

/** "P000194 · 230170": the internal code and the SKU, the ones the staff search by. */
export const productCodes = (product: { code?: string | null; sku?: string | null }) =>
  [product.code, product.sku].filter(Boolean).join(' · ')

/**
 * The internal code and the SKU of a product, shown next to its name
 * everywhere in the admin. Renders nothing when the product has neither.
 */
const ProductCodes: React.FC<{
  code?: string | null
  sku?: string | null
  // a line of its own above or below the name
  block?: boolean
  className?: string
}> = ({ code, sku, block = false, className = '' }) => {
  const text = productCodes({ code, sku })
  if (!text) return null
  return (
    <span
      className={`${block ? 'block' : 'inline-block'} font-mono text-xs text-gray-600 dark:text-gray-300 ${className}`}
    >
      {text}
    </span>
  )
}

export default ProductCodes

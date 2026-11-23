'use client'
import React from 'react'
import { SaleDots } from '@/components/common/SaleMarks/SaleMarks'

/** "P000194 · 230170": the internal code and the SKU, the ones the staff search by. */
export const productCodes = (product: { code?: string | null; sku?: string | null }) =>
  [product.code, product.sku].filter(Boolean).join(' · ')

/**
 * The internal code and the SKU of a product, shown next to its name
 * everywhere in the admin. With the product's id it also shows a dot in the
 * color of each sale the product is on. Renders nothing when there is nothing.
 */
const ProductCodes: React.FC<{
  productId?: string | null
  code?: string | null
  sku?: string | null
  // a line of its own above or below the name
  block?: boolean
  className?: string
}> = ({ productId, code, sku, block = false, className = '' }) => {
  const text = productCodes({ code, sku })
  if (!text && !productId) return null
  return (
    <span
      className={`${block ? 'block' : 'inline-block'} font-mono text-xs text-gray-600 dark:text-gray-300 ${className}`}
    >
      <SaleDots productId={productId} className={text ? 'mr-1.5' : ''} />
      {text}
    </span>
  )
}

export default ProductCodes

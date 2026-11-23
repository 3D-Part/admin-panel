'use client'
import React from 'react'
import { tx } from '@/shared/i18n'
import { DEFAULT_SALE_COLOR, SaleTag, saleTiming, useSaleTags } from '@/shared/helpers/saleTags'

const describe = (tag: SaleTag) =>
  `${tag.name} · ${Number(tag.discountedPrice).toFixed(2)} KM · ${saleTiming(tag.startsAt, tag.endsAt).text}`

/**
 * A small dot in the color of each sale the product is on (one that has not
 * ended); a sale that has not started yet is a ring. The sale, the price and
 * the days show on hover.
 */
export const SaleDots: React.FC<{ productId?: string | null; className?: string }> = ({
  productId,
  className = '',
}) => {
  const tags = useSaleTags()[productId ?? ''] ?? []
  if (!productId || tags.length === 0) return null
  return (
    <span className={`inline-flex items-center gap-0.5 align-middle ${className}`}>
      {tags.map((tag) => {
        const color = tag.color || DEFAULT_SALE_COLOR
        const upcoming = saleTiming(tag.startsAt, tag.endsAt).state === 'upcoming'
        return (
          <span
            key={tag.productOnSaleId}
            title={describe(tag)}
            aria-label={tx('On sale: {name}', { name: describe(tag) })}
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={
              upcoming
                ? { boxShadow: `inset 0 0 0 2px ${color}` }
                : { backgroundColor: color }
            }
          />
        )
      })}
    </span>
  )
}

// a sale that has not started yet has a dashed border
const pillStyle = (tag: SaleTag, color: string): React.CSSProperties => ({
  borderColor: color,
  borderStyle: saleTiming(tag.startsAt, tag.endsAt).state === 'upcoming' ? 'dashed' : 'solid',
  backgroundColor: `${color}1f`,
})

/** A pill per sale the product is on: name, price and days, in the sale's color. */
export const SalePills: React.FC<{
  productId?: string | null
  // the sale this list is shown in, left out
  exceptSaleId?: string
  // only the dot and the name, the rest on hover (e.g. in a table)
  compact?: boolean
}> = ({ productId, exceptSaleId, compact = false }) => {
  const tags = (useSaleTags()[productId ?? ''] ?? []).filter((tag) => tag.saleId !== exceptSaleId)
  if (!productId || tags.length === 0) return null
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const color = tag.color || DEFAULT_SALE_COLOR
        if (compact) {
          return (
            <span
              key={tag.productOnSaleId}
              title={describe(tag)}
              className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-100"
              style={pillStyle(tag, color)}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate">{tag.name}</span>
            </span>
          )
        }
        return (
          <span
            key={tag.productOnSaleId}
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-100"
            style={pillStyle(tag, color)}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {tag.name} · {Number(tag.discountedPrice).toFixed(2)} KM ·{' '}
            <span className="text-gray-600 dark:text-gray-300">
              {saleTiming(tag.startsAt, tag.endsAt).text}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/** Which sales the product is on (that have not ended), for the product page. */
export const ProductSalesBox: React.FC<{ productId?: string | null; className?: string }> = ({
  productId,
  className = '',
}) => {
  const tags = useSaleTags()[productId ?? ''] ?? []
  if (!productId) return null
  return (
    <div className={`w-full ${className}`}>
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{tx('Sales')}</p>
      {tags.length > 0 ? (
        <SalePills productId={productId} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{tx('Not on any running or upcoming sale.')}</p>
      )}
    </div>
  )
}

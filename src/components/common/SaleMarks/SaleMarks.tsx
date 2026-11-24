'use client'
import React from 'react'
import Link from 'next/link'
import { tx } from '@/shared/i18n'
import { DEFAULT_SALE_COLOR, SaleTag, saleTiming, useSaleTags } from '@/shared/helpers/saleTags'

const describe = (tag: SaleTag) =>
  `${tag.name} · ${Number(tag.discountedPrice).toFixed(2)} KM · ${saleTiming(tag.startsAt, tag.endsAt).text}`

/** Where a sale is opened in the admin. */
export const saleHref = (saleId: string) => `/sales?sale=${encodeURIComponent(saleId)}`

// a sale that has not started yet has a dashed border
const pillStyle = (tag: SaleTag, color: string): React.CSSProperties => ({
  borderColor: color,
  borderStyle: saleTiming(tag.startsAt, tag.endsAt).state === 'upcoming' ? 'dashed' : 'solid',
  backgroundColor: `${color}1f`,
})

/**
 * One sale as a pill in its color, with its name; it opens that sale. Inside
 * rows that open something themselves the click stays with the pill.
 */
const SalePill: React.FC<{ tag: SaleTag; full?: boolean; small?: boolean }> = ({ tag, full = false, small = false }) => {
  const color = tag.color || DEFAULT_SALE_COLOR
  return (
    <Link
      href={saleHref(tag.saleId)}
      title={`${describe(tag)} · ${tx('Open the sale')}`}
      onClick={(event) => event.stopPropagation()}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium text-gray-800 no-underline transition hover:brightness-110 hover:underline dark:text-gray-100 ${
        small ? 'max-w-[12rem] px-1.5 py-px text-[11px] leading-4' : 'px-2 py-0.5 text-xs'
      } ${full ? '' : 'max-w-[14rem]'}`}
      style={pillStyle(tag, color)}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {full ? (
        <span>
          {tag.name} · {Number(tag.discountedPrice).toFixed(2)} KM ·{' '}
          <span className="text-gray-600 dark:text-gray-300">{saleTiming(tag.startsAt, tag.endsAt).text}</span>
        </span>
      ) : (
        <span className="truncate">{tag.name}</span>
      )}
    </Link>
  )
}

/**
 * The sales the product is on (that have not ended), each as a small pill
 * with the sale's name in its color; the price and days show on hover.
 */
export const SaleDots: React.FC<{ productId?: string | null; className?: string }> = ({
  productId,
  className = '',
}) => {
  const tags = useSaleTags()[productId ?? ''] ?? []
  if (!productId || tags.length === 0) return null
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 align-middle ${className}`}>
      {tags.map((tag) => (
        <SalePill key={tag.productOnSaleId} tag={tag} small />
      ))}
    </span>
  )
}

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
      {tags.map((tag) => (
        <SalePill key={tag.productOnSaleId} tag={tag} full={!compact} />
      ))}
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

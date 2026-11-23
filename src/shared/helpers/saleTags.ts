'use client'
import { useEffect, useState } from 'react'
import { API } from '@/shared/helpers'
import { tx, useLanguageStore } from '@/shared/i18n'

/**
 * Every sale has its own color, and every product on a sale that has not
 * ended is marked with it wherever the admin shows the product.
 */

// the same palette as the API, which gives a new sale the first unused one
export const SALE_COLORS = [
  '#e11d48',
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#9333ea',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#ea580c',
  '#4f46e5',
]

export const DEFAULT_SALE_COLOR = '#9ca3af'

export const nextSaleColor = (used: (string | null | undefined)[]) => {
  const taken = new Set(used.filter(Boolean).map((color) => color!.toLowerCase()))
  return SALE_COLORS.find((color) => !taken.has(color)) ?? SALE_COLORS[used.length % SALE_COLORS.length]
}

export type SaleTag = {
  productId: string
  productOnSaleId: string
  discountedPrice: number
  saleId: string
  name: string
  color: string | null
  startsAt: string
  endsAt: string
}

const DAY = 24 * 60 * 60 * 1000

// one form for 1 (21, 31… in Serbian), another for the rest
const isOne = (days: number) =>
  useLanguageStore.getState().language === 'sr'
    ? days % 10 === 1 && days % 100 !== 11
    : days === 1

/**
 * Whether a sale has not started, runs or has ended, and the words for it:
 * "starts in 3 days", "5 days left", "ended".
 */
export const saleTiming = (startsAt: string, endsAt: string, now = Date.now()) => {
  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()
  if (now < start) {
    const days = Math.ceil((start - now) / DAY)
    return {
      state: 'upcoming' as const,
      days,
      text: tx(isOne(days) ? 'starts in {days} day' : 'starts in {days} days', { days }),
    }
  }
  if (now < end) {
    const days = Math.ceil((end - now) / DAY)
    return {
      state: 'running' as const,
      days,
      text: tx(isOne(days) ? '{days} day left' : '{days} days left', { days }),
    }
  }
  return { state: 'ended' as const, days: 0, text: tx('ended') }
}

// one request for every mark on the page; saving a sale loads them again
let cache: SaleTag[] | null = null
let loading: Promise<void> | null = null
const listeners = new Set<(tags: SaleTag[]) => void>()

const load = () => {
  if (!loading) {
    loading = API.get<SaleTag[]>(`${process.env.API_KEY}/shop/sale/product-tags`)
      .then((tags) => {
        cache = Array.isArray(tags) ? tags : []
        listeners.forEach((listener) => listener(cache!))
      })
      .catch(() => {
        cache = cache ?? []
      })
      .finally(() => {
        loading = null
      })
  }
  return loading
}

/** Load the marks again, after a sale or a product on it was changed. */
export const refreshSaleTags = () => load()

/** Every product on a sale that has not ended, by product id. */
export const useSaleTags = (): Record<string, SaleTag[]> => {
  const [tags, setTags] = useState<SaleTag[]>(cache ?? [])

  useEffect(() => {
    listeners.add(setTags)
    if (cache) setTags(cache)
    else load()
    return () => {
      listeners.delete(setTags)
    }
  }, [])

  const byProduct: Record<string, SaleTag[]> = {}
  tags.forEach((tag) => {
    ;(byProduct[tag.productId] ??= []).push(tag)
  })
  return byProduct
}

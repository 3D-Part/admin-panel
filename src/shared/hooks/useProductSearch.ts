'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ProductsAPI } from '@/services'
import { ProductGroupId } from '@/services/products'
import { WarehouseProduct } from '@/shared/types/warehouse'

const PAGE_SIZE = 20

/**
 * The product search of the admin pickers. Searches after a short pause in
 * typing, then loads the next page whenever the list is scrolled near its
 * end, so there is no fixed number of results. Answers that arrive after the
 * search changed are dropped.
 *
 * Put `onScroll` on the scrolling list; `hasMore` and `loading` tell what to
 * show at its end.
 */
export const useProductSearch = (
  search: string,
  minLength = 2,
  // only the products of a product group, or those outside it
  group?: { id: ProductGroupId; member: boolean }
) => {
  const term = search.trim()
  const groupKey = group ? `${group.id}:${group.member}` : ''
  const groupRef = useRef(group)
  groupRef.current = group
  // bumped by reload() after the list was changed
  const [round, setRound] = useState(0)
  const [rows, setRows] = useState<WarehouseProduct[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const request = useRef(0)
  const busy = useRef(false)

  useEffect(() => {
    const id = ++request.current
    busy.current = false
    setSearched(false)
    if (term.length < minLength) {
      setRows([])
      setCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const timeout = setTimeout(async () => {
      const page = await ProductsAPI.searchProducts(term, 0, PAGE_SIZE, groupRef.current)
      if (id !== request.current) return
      setRows(page?.rows ?? [])
      setCount(page?.count ?? 0)
      setLoading(false)
      setSearched(true)
    }, 300)
    return () => clearTimeout(timeout)
  }, [term, minLength, groupKey, round])

  const hasMore = rows.length < count

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore || term.length < minLength) return
    const id = request.current
    busy.current = true
    setLoading(true)
    const page = await ProductsAPI.searchProducts(term, rows.length, PAGE_SIZE, groupRef.current)
    if (id !== request.current) return
    busy.current = false
    setLoading(false)
    if (!page) return
    setRows((current) => [
      ...current,
      ...page.rows.filter((row) => !current.some((c) => c.id === row.id)),
    ])
    setCount(page.count)
  }, [hasMore, term, minLength, rows.length])

  // load the next page when the list is scrolled close to its end
  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const el = e.currentTarget
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) loadMore()
    },
    [loadMore]
  )

  /** Takes a product out of the shown results, e.g. once it is added. */
  const drop = useCallback((id: string) => {
    setRows((current) => current.filter((row) => row.id !== id))
    setCount((current) => Math.max(0, current - 1))
  }, [])

  const reload = useCallback(() => setRound((value) => value + 1), [])

  return { rows, count, loading, searched, hasMore, loadMore, onScroll, drop, reload }
}

'use client'
import { useCallback, useEffect, useState } from 'react'
import { BackofficeAPI } from '@/services'

export type NewsKey =
  | 'orders'
  | 'offers'
  | 'users'
  | 'subscribers'
  | 'actions'
  | 'stock'
  | 'tasks'

// what counts from the time the admin last looked at the section
const SEEN_SECTIONS: NewsKey[] = ['orders', 'offers', 'users', 'subscribers']
const POLL_MS = 60_000

const seenKey = (section: string) => `newsSeen:${section}`

const readSeen = (section: string) => {
  try {
    return localStorage.getItem(seenKey(section))
  } catch {
    return null
  }
}

const writeSeen = (section: string, time: string) => {
  try {
    localStorage.setItem(seenKey(section), time)
  } catch {}
}

/**
 * The counters of the sidebar. Orders, offers, users and subscribers show what
 * arrived since the admin last had that section open (remembered in this
 * browser; the first visit starts from now). Actions, stock and workers' tasks
 * show how many are open. `current` is the section on screen: it counts as
 * seen all the time, so its own indicator stays clear.
 */
export const useSidebarNews = (current: NewsKey | null, enabled: boolean) => {
  const [counts, setCounts] = useState<Partial<Record<NewsKey, number>>>({})

  const refresh = useCallback(async () => {
    const now = new Date().toISOString()
    const since: Record<string, string> = {}
    SEEN_SECTIONS.forEach((section) => {
      if (section === current || !readSeen(section)) writeSeen(section, now)
      since[section] = readSeen(section) as string
    })
    const data = await BackofficeAPI.getNews(since)
    if (!data) return
    setCounts({ ...data, ...(current ? { [current]: SEEN_SECTIONS.includes(current) ? 0 : data[current] } : {}) })
  }, [current])

  useEffect(() => {
    if (!enabled) return
    refresh()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh, enabled])

  return counts
}

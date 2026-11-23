'use client'

import BackofficeAPI, { AssistantHealth } from '@/services/backoffice'
import { tx } from '@/shared/i18n'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const CHECK_EVERY_MS = 5 * 60 * 1000
const DISMISSED_KEY = 'assistantAlertDismissed'

const TEXTS = {
  credit: {
    title: 'No balance for the chat assistant',
    body: 'There is no money left on the balance of the AI provider, so the chat is hidden from the site. Top up the balance and the chat comes back by itself within 30 minutes, or at once when you save the key again.',
  },
  key: {
    title: 'The chat assistant key is refused',
    body: 'The AI provider refused the API key, so the chat is hidden from the site. Save a valid key in Settings.',
  },
  budget: {
    title: 'The chat assistant spent its daily limit',
    body: 'The chat spent the daily limit set in Settings, so it is hidden from the site until tomorrow. If that is normal traffic, raise the limit; if not, someone may be trying to spend the balance on purpose.',
  },
  failing: {
    title: 'The chat assistant is not working',
    body: 'The AI provider failed several times in a row, so the chat is hidden from the site for a few minutes. It is tried again by itself.',
  },
} as const

// A notice in the corner of the admin when the chat assistant of the site
// does not work (no money on the balance, a refused key). Closed, it stays
// closed for the same problem until the tab is closed.
const AssistantAlert = () => {
  const [health, setHealth] = useState<AssistantHealth | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY))
    } catch {}
    const check = () => BackofficeAPI.getAssistantHealth().then((data) => setHealth(data ?? null))
    check()
    const timer = setInterval(check, CHECK_EVERY_MS)
    return () => clearInterval(timer)
  }, [])

  if (!health?.enabled || !health.problem) return null
  const id = `${health.problem}:${health.since}`
  if (dismissed === id) return null
  const text = TEXTS[health.problem]

  const close = () => {
    setDismissed(id)
    try {
      sessionStorage.setItem(DISMISSED_KEY, id)
    } catch {}
  }

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border border-red-300 bg-red-50 p-4 shadow-lg dark:border-red-800 dark:bg-gray-800"
    >
      <div className="flex items-start gap-3">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{tx(text.title)}</p>
          <p className="mt-1 text-sm text-red-700 dark:text-gray-300">{tx(text.body)}</p>
          <Link
            href="/settings/general?tab=assistant"
            onClick={close}
            className="mt-3 inline-block rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            {tx('Open chat settings')}
          </Link>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={tx('Close')}
          className="text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AssistantAlert

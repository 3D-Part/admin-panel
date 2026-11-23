'use client'
import React from 'react'
import { saleTiming } from '@/shared/helpers/saleTags'

const STYLES = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  running: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  ended: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

/** "starts in 3 days", "5 days left" or "ended". */
const SaleTimingBadge: React.FC<{ startsAt: string; endsAt: string }> = ({ startsAt, endsAt }) => {
  const timing = saleTiming(startsAt, endsAt)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[timing.state]}`}>
      {timing.text}
    </span>
  )
}

export default SaleTimingBadge

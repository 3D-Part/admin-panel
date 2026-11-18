'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Spinner } from 'flowbite-react'

/**
 * The last row of a search result list: how many are shown, a spinner while
 * the next page loads, and a button for when the list is too short to scroll.
 */
const SearchListFooter: React.FC<{
  shown: number
  count: number
  loading: boolean
  hasMore: boolean
  onMore: () => void
}> = ({ shown, count, loading, hasMore, onMore }) => {
  if (!count) return null
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
      <span>{tx('{shown} of {count}', { shown, count })}</span>
      {loading ? (
        <Spinner size="sm" aria-label={tx('Loading')} />
      ) : (
        hasMore && (
          <button
            type="button"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            onClick={onMore}
          >
            {tx('Load more')}
          </button>
        )
      )}
    </div>
  )
}

export default SearchListFooter

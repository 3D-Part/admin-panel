import React from 'react'
import {
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleLeft,
} from 'react-icons/hi'

interface MobilePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  count?: number
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  count,
}) => {
  const goToFirst = () => onPageChange(1)
  const goToPrevious = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1))

  return (
    <div className="mobile-pagination-container">
      <div className="flex items-center justify-center gap-3 w-full">
        {/* First Page Button */}
        <button
          onClick={goToFirst}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Go to first page"
        >
          <HiChevronDoubleLeft className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Go to previous page"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        {/* Current Page Display */}
        <div className="flex items-center justify-center min-w-[60px] h-10 px-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 font-semibold text-sm">
          {currentPage} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Go to next page"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Total Count */}
      {count && (
        <p className="table-total-text text-sm text-center">Total: {count}</p>
      )}
    </div>
  )
}

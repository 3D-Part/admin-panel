import React from 'react'
import { MobileTableCard, MobileCardItem } from '../ResponsiveTable'
import { MobilePagination } from '../MobilePagination'

interface ResponsiveTableWrapperProps {
  children: React.ReactNode
  mobileCards?: React.ReactNode
  // phones get the table too (scrolled sideways) instead of the cards
  tableOnPhone?: boolean
  className?: string
  // Pagination props
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  count?: number
}

export const ResponsiveTableWrapper: React.FC<ResponsiveTableWrapperProps> = ({
  children,
  mobileCards,
  tableOnPhone = false,
  className = '',
  currentPage,
  totalPages,
  onPageChange,
  count,
}) => {
  const hasPagination = Boolean(currentPage && totalPages && onPageChange)

  if (tableOnPhone) {
    return (
      <div
        className={`flex flex-col mt-8 flex-1 overflow-hidden h-full ${className}`}
      >
        <div className="table-on-phone flex w-full flex-col overflow-hidden flex-1">
          {children}
        </div>

        {hasPagination && (
          <div className="md:hidden">
            <MobilePagination
              currentPage={currentPage!}
              totalPages={totalPages!}
              onPageChange={onPageChange!}
              count={count}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col mt-8 flex-1 overflow-hidden h-full ${className}`}
    >
      {/* Desktop Table */}
      <div className="table-desktop flex-1">{children}</div>

      {/* Mobile Cards */}
      <div className="table-mobile">
        <div className="mobile-card-container">{mobileCards}</div>

        {currentPage && totalPages && onPageChange && (
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            count={count}
          />
        )}
      </div>
    </div>
  )
}

// Mobile card builder for common table patterns
interface MobileCardBuilderProps {
  title: React.ReactNode
  subtitle?: string
  items: Array<{
    label: string
    value: React.ReactNode
    className?: string
  }>
  actions?: React.ReactNode
  onClick?: () => void
  className?: string
}

export const MobileCardBuilder: React.FC<MobileCardBuilderProps> = ({
  title,
  subtitle,
  items,
  actions,
  onClick,
  className = '',
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on actions area or dropdown elements
    const target = e.target as HTMLElement
    if (
      target.closest('.mobile-card-actions') ||
      target.closest('[role="menu"]') ||
      target.closest('[data-testid="flowbite-dropdown"]') ||
      target.closest('.dropdown')
    ) {
      e.stopPropagation()
      return
    }

    if (onClick) {
      onClick()
    }
  }

  return (
    <MobileTableCard onClick={handleCardClick} className={className}>
      <div className="mobile-card-header">
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mobile-card-content">
        {items.map((item, index) => (
          <MobileCardItem
            key={index}
            label={item.label}
            value={item.value}
            className={item.className}
          />
        ))}
      </div>

      {actions && <div className="mobile-card-actions">{actions}</div>}
    </MobileTableCard>
  )
}

import React from 'react'
import { Table } from 'flowbite-react'

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`overflow-x-auto relative min-h-[100px] table-container ${className}`}
    >
      <Table className="w-full">{children}</Table>
    </div>
  )
}

// Mobile card component for responsive table rows
interface MobileTableCardProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export const MobileTableCard: React.FC<MobileTableCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]'
          : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Mobile card item component
interface MobileCardItemProps {
  label: string
  value: React.ReactNode
  className?: string
}

export const MobileCardItem: React.FC<MobileCardItemProps> = ({
  label,
  value,
  className = '',
}) => {
  return (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}:
      </span>
      <span className="text-sm text-gray-900 dark:text-white font-medium">
        {value}
      </span>
    </div>
  )
}

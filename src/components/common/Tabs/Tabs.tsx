'use client'
import React, { ReactNode } from 'react'

type TabItem = {
  id: string | number
  title: string
  icon?: React.ComponentType<{ className?: string }>
  content: ReactNode
  disabled?: boolean
}

type GroupProps = {
  children: React.ReactNode
  className?: string
}

const Group: React.FC<GroupProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  )
}

type ItemProps = {
  id: string | number
  title: string
  icon?: React.ComponentType<{ className?: string }>
  active: boolean
  disabled?: boolean
  onClick: () => void
  children?: ReactNode
}

const Item: React.FC<ItemProps> = ({
  id,
  title,
  icon: IconComponent,
  active,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      key={id}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`
        relative flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-300 ease-in-out
        border-b-2
        ${
          active
            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        rounded-t-lg
      `}
    >
      {IconComponent && (
        <IconComponent
          className={`w-5 h-5 transition-transform duration-200 ${
            active ? 'scale-110' : ''
          }`}
        />
      )}
      <span>{title}</span>
    </button>
  )
}

type ModernTabsProps = {
  tabs: TabItem[]
  activeTab: string | number
  onTabChange: (tabId: string | number) => void
  className?: string
}

const ModernTabs: React.FC<ModernTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Modern Tabs Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  relative flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-300 ease-in-out
                  border-b-2
                  ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                  ${
                    tab.disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  }
                  rounded-t-lg
                `}
              >
                {IconComponent && (
                  <IconComponent
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`}
                  />
                )}
                <span>{tab.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="relative">
        <div className="transition-all duration-300 ease-in-out">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  )
}

const Tabs = {
  Group,
  Item,
  ModernTabs,
}

export default Tabs

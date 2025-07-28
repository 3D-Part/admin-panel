'use client'

import { HiAdjustments, HiUserCircle } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import { useState } from 'react'
import GeneralInfo from '../GeneralInfo/GeneralInfo'
import Gallery from '../Gallery/Gallery'
import ProductAttributes from '../ProductAttributes/ProductAttributes'

export const TabsMenu = () => {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    {
      id: 0,
      title: 'General Info',
      icon: HiUserCircle,
      content: <GeneralInfo />,
      disabled: false,
    },
    {
      id: 1,
      title: 'Gallery',
      icon: MdDashboard,
      content: <Gallery />,
      disabled: false,
    },
    {
      id: 2,
      title: 'Attributes',
      icon: HiAdjustments,
      content: <ProductAttributes />,
      disabled: false,
    },
  ]

  return (
    <div className="w-full">
      {/* Modern Tabs Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
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
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span>{tab.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="relative">
        <div className="transition-all duration-300 ease-in-out">
          {tabs[activeTab].content}
        </div>
      </div>
    </div>
  )
}

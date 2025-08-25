import React from 'react'
import type { MenuItemNode } from '@/store/slices/menuBuilderSlice'

interface MenuItemContentProps {
  item: MenuItemNode
}

const MenuItemContent: React.FC<MenuItemContentProps> = ({ item }) => {
  return (
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        {/* Type icon */}
        {item.type === 'link' ? (
          <span className="text-blue-600 dark:text-blue-400 text-sm flex-shrink-0">
            🔗
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
            📝
          </span>
        )}

        {/* Label */}
        <span className="font-medium text-gray-900 dark:text-white truncate">
          {item.label}
        </span>

        {/* URL preview */}
        {item.type === 'link' && item.url && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-32">
            {item.url}
          </span>
        )}
      </div>
    </div>
  )
}

export default MenuItemContent

import React, { useState } from 'react'
import { HiChevronDown, HiChevronRight } from 'react-icons/hi'
import type { MenuItemNode } from '@/store/slices/menuBuilderSlice'
import MenuItemIndicator from './MenuItemIndicator'
import MenuItemContent from './MenuItemContent'
import MenuItemActions from './MenuItemActions'

interface MenuItemComponentProps {
  item: MenuItemNode
  level: number
  onEdit: (item: MenuItemNode) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onIndentRight: (id: string) => void
  onIndentLeft: (id: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
  canIndentRight: boolean
  canIndentLeft: boolean
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  level,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onIndentRight,
  onIndentLeft,
  canMoveUp,
  canMoveDown,
  canIndentRight,
  canIndentLeft,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const hasChildren = item.children.length > 0

  const toggleCollapse = () => {
    if (hasChildren) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden
          border border-gray-200 dark:border-gray-700 rounded-lg mb-1
          bg-white dark:bg-gray-900 
          hover:bg-gray-50 dark:hover:bg-gray-800/50 
          transition-all duration-200 ease-in-out
          ${level > 0 ? 'ml-6' : ''}
        `}
      >
        <div className="flex items-center justify-between p-3">
          {/* Left border indicator for hierarchy with rotating colors */}
          <MenuItemIndicator level={level} />

          {/* Item content with collapse toggle */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Collapse/Expand button */}
            {hasChildren && (
              <button
                onClick={toggleCollapse}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? (
                  <HiChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <HiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            )}

            {/* Spacer for items without children */}
            {!hasChildren && <div className="w-6 flex-shrink-0" />}

            {/* Content */}
            <MenuItemContent item={item} />
          </div>

          {/* Action buttons */}
          <MenuItemActions
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onIndentRight={onIndentRight}
            onIndentLeft={onIndentLeft}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            canIndentRight={canIndentRight}
            canIndentLeft={canIndentLeft}
          />
        </div>

        {/* Children container with subtle border */}
        {hasChildren && !isCollapsed && (
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            {item.children.map((child, index) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onIndentRight={onIndentRight}
                onIndentLeft={onIndentLeft}
                canMoveUp={index > 0}
                canMoveDown={index < item.children.length - 1}
                canIndentRight={true}
                // canIndentLeft={level > 0}
                canIndentLeft={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuItemComponent

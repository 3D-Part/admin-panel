import React from 'react'
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
  return (
    <div className="relative">
      {/* Left border indicator for hierarchy with rotating colors */}

      <div
        className={`relative overflow-hidden
          border border-gray-200 dark:border-gray-700 rounded-lg mb-1
          bg-white dark:bg-gray-900 
          hover:bg-gray-50 dark:hover:bg-gray-800/50 
          transition-all duration-200 ease-in-out
          ${level > 0 ? 'ml-5' : ''}
        `}
      >
        <MenuItemIndicator level={level} />

        <div className="flex items-center justify-between p-3">
          {/* Item content */}
          <MenuItemContent item={item} />

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
        {item.children.length > 0 && (
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
                canIndentLeft={level > 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuItemComponent

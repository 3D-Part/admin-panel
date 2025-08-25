import React from 'react'
import { Button } from 'flowbite-react'
import {
  HiPencil,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiChevronRight,
  HiChevronLeft,
} from 'react-icons/hi'
import type { MenuItemNode } from '@/store/slices/menuBuilderSlice'

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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
      <div
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        style={{ paddingLeft: `${level * 20 + 16}px` }}
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex items-center space-x-2">
            {item.type === 'link' ? (
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                🔗
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                📝
              </span>
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
            {item.type === 'link' && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({item.url})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            color="gray"
            onClick={() => onEdit(item)}
            className="!p-2"
            title="Edit"
          >
            <HiPencil className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            color="failure"
            onClick={() => onDelete(item.id)}
            className="!p-2"
            title="Delete"
          >
            <HiTrash className="h-4 w-4" />
          </Button>

          <div className="border-l border-gray-300 dark:border-gray-600 mx-2 h-6" />

          <Button
            size="sm"
            color="gray"
            onClick={() => onMoveUp(item.id)}
            disabled={!canMoveUp}
            className="!p-2"
            title="Move Up"
          >
            <HiChevronUp className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            color="gray"
            onClick={() => onMoveDown(item.id)}
            disabled={!canMoveDown}
            className="!p-2"
            title="Move Down"
          >
            <HiChevronDown className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            color="gray"
            onClick={() => onIndentRight(item.id)}
            disabled={!canIndentRight}
            className="!p-2"
            title="Indent Right (Make Child)"
          >
            <HiChevronRight className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            color="gray"
            onClick={() => onIndentLeft(item.id)}
            disabled={!canIndentLeft}
            className="!p-2"
            title="Indent Left (Move Up Level)"
          >
            <HiChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {item.children.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
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
  )
}

export default MenuItemComponent

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

interface MenuItemActionsProps {
  item: MenuItemNode
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

const MenuItemActions: React.FC<MenuItemActionsProps> = ({
  item,
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
    <div className="flex items-center space-x-1 flex-shrink-0">
      {/* Edit & Delete */}
      <Button
        size="xs"
        color="gray"
        onClick={() => onEdit(item)}
        className="!p-1.5 !h-8 !w-8"
        title="Edit"
      >
        <HiPencil className="h-3.5 w-3.5" />
      </Button>

      <Button
        size="xs"
        color="failure"
        onClick={() => onDelete(item.id)}
        className="!p-1.5 !h-8 !w-8"
        title="Delete"
      >
        <HiTrash className="h-3.5 w-3.5" />
      </Button>

      <div className="border-l border-gray-300 dark:border-gray-600 mx-1.5 h-5" />

      {/* Movement controls */}
      <Button
        size="xs"
        color="gray"
        onClick={() => onMoveUp(item.id)}
        disabled={!canMoveUp}
        className="!p-1.5 !h-8 !w-8"
        title="Move Up"
      >
        <HiChevronUp className="h-3.5 w-3.5" />
      </Button>

      <Button
        size="xs"
        color="gray"
        onClick={() => onMoveDown(item.id)}
        disabled={!canMoveDown}
        className="!p-1.5 !h-8 !w-8"
        title="Move Down"
      >
        <HiChevronDown className="h-3.5 w-3.5" />
      </Button>

      <Button
        size="xs"
        color="gray"
        onClick={() => onIndentRight(item.id)}
        disabled={!canIndentRight}
        className="!p-1.5 !h-8 !w-8"
        title="Indent Right (Make Child)"
      >
        <HiChevronRight className="h-3.5 w-3.5" />
      </Button>

      <Button
        size="xs"
        color="gray"
        onClick={() => onIndentLeft(item.id)}
        disabled={!canIndentLeft}
        className="!p-1.5 !h-8 !w-8"
        title="Indent Left (Move Up Level)"
      >
        <HiChevronLeft className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export default MenuItemActions

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import {
  HiPencil,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiChevronRight,
  HiChevronLeft,
  HiDotsVertical,
  HiX,
} from 'react-icons/hi'
import { useIsPhone } from '@/shared/hooks/useMediaQuerry'
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
  const isPhone = useIsPhone()
  const [showMobileActions, setShowMobileActions] = useState(false)

  const toggleMobileActions = () => {
    setShowMobileActions(!showMobileActions)
  }

  return (
    <>
      {/* Mobile Actions Button - only visible on mobile */}
      {isPhone && (
        <Button
          size="sm"
          color="gray"
          onClick={toggleMobileActions}
          className="!p-2 !h-8 !w-8 flex-shrink-0 md:hidden"
          title="Show actions"
        >
          <HiDotsVertical className="h-4 w-4" />
        </Button>
      )}

      {/* Actions Container - same structure for both mobile and desktop */}
      <div
        className={`flex items-center space-x-1 flex-shrink-0 justify-between ${
          isPhone
            ? `absolute inset-0 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10 p-4 transition-transform duration-300 ease-in-out ${
                showMobileActions ? 'translate-x-0' : 'translate-x-full'
              } md:relative md:bg-transparent md:border-0 md:shadow-none md:z-auto md:p-0 md:translate-x-0`
            : ''
        }`}
      >
        <div className="flex items-center space-x-1 flex-wrap gap-2">
          <Button
            size="xs"
            color="gray"
            onClick={() => {
              onEdit(item)
              if (isPhone) setShowMobileActions(false)
            }}
            className="!p-1.5 !h-8 !w-8"
            title="Edit"
          >
            <HiPencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="xs"
            color="failure"
            onClick={() => {
              onDelete(item.id)
              if (isPhone) setShowMobileActions(false)
            }}
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
            onClick={() => {
              onMoveUp(item.id)
              if (isPhone) setShowMobileActions(false)
            }}
            disabled={!canMoveUp}
            className="!p-1.5 !h-8 !w-8"
            title="Move Up"
          >
            <HiChevronUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="xs"
            color="gray"
            onClick={() => {
              onMoveDown(item.id)
              if (isPhone) setShowMobileActions(false)
            }}
            disabled={!canMoveDown}
            className="!p-1.5 !h-8 !w-8"
            title="Move Down"
          >
            <HiChevronDown className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="xs"
            color="gray"
            onClick={() => {
              onIndentRight(item.id)
              if (isPhone) setShowMobileActions(false)
            }}
            disabled={!canIndentRight}
            className="!p-1.5 !h-8 !w-8"
            title="Indent Right (Make Child)"
          >
            <HiChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="xs"
            color="gray"
            onClick={() => {
              onIndentLeft(item.id)
              if (isPhone) setShowMobileActions(false)
            }}
            disabled={!canIndentLeft}
            className="!p-1.5 !h-8 !w-8"
            title="Indent Left (Move Up Level)"
          >
            <HiChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
        {/* Edit & Delete */}

        {/* Mobile Close Button - only visible on mobile */}
        {isPhone && (
          <Button
            size="xs"
            color="gray"
            onClick={toggleMobileActions}
            className="!p-1.5 !h-8 !w-8 ml-2 md:hidden"
            title="Close actions"
          >
            <HiX className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </>
  )
}

export default MenuItemActions

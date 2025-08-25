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

  if (isPhone) {
    return (
      <>
        {/* Mobile Actions Button */}
        <Button
          size="sm"
          color="gray"
          onClick={toggleMobileActions}
          className="!p-2 !h-8 !w-8 flex-shrink-0"
          title="Show actions"
        >
          <HiDotsVertical className="h-4 w-4" />
        </Button>

        {/* Mobile Actions Slide-in Overlay */}
        <div
          className={`absolute inset-0 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10 flex justify-between gap-2 items-center p-4 transition-transform duration-300 ease-in-out ${
            showMobileActions ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-nowrap overflow-x-auto items-center space-x-1  gap-2 no-scrollbar">
            {/* Edit & Delete */}
            <Button
              size="xs"
              color="gray"
              onClick={() => {
                onEdit(item)
                setShowMobileActions(false)
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
                setShowMobileActions(false)
              }}
              className="!p-1.5 !h-8 !w-8"
              title="Delete"
            >
              <HiTrash className="h-3.5 w-3.5" />
            </Button>

            {/* <div className="border-l border-gray-300 dark:border-gray-600 mx-1.5 h-5" /> */}

            {/* Movement controls */}
            <Button
              size="xs"
              color="gray"
              onClick={() => {
                onMoveUp(item.id)
                setShowMobileActions(false)
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
                setShowMobileActions(false)
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
                setShowMobileActions(false)
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
                setShowMobileActions(false)
              }}
              disabled={!canIndentLeft}
              className="!p-1.5 !h-8 !w-8"
              title="Indent Left (Move Up Level)"
            >
              <HiChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Close button */}
          <Button
            size="sm"
            color="gray"
            onClick={toggleMobileActions}
            className="!p-1.5 !h-8 !w-8"
          >
            <HiX className="h-3.5 w-3.5" />
          </Button>
        </div>
      </>
    )
  }

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

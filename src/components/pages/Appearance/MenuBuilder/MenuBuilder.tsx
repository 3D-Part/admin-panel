'use client'

import React, { useState, useCallback } from 'react'
import { Button, Modal, TextInput, Select } from 'flowbite-react'
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiChevronRight,
  HiChevronLeft,
} from 'react-icons/hi'
import { useMenuBuilderStore } from '@/store/store'
import type {
  MenuItemNode,
  MenuItemType,
} from '@/store/slices/menuBuilderSlice'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    item: Omit<MenuItemNode, 'id' | 'children'> & { parentId?: string }
  ) => void
  item?: MenuItemNode & { parentId?: string }
  allItems: (MenuItemNode & { parentId?: string })[]
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  allItems,
}) => {
  const [formData, setFormData] = useState({
    type: item?.type || 'link',
    label: item?.label || '',
    url: item?.url || '',
    parentId: item?.parentId || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const availableParents = allItems.filter((i) => i.id !== item?.id)

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>{item ? 'Edit Menu Item' : 'Add Menu Item'}</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as MenuItemType,
                })
              }
            >
              <option value="link">Custom Link</option>
              <option value="text">Text Only</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Label
            </label>
            <TextInput
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="Enter label"
              required
            />
          </div>

          {formData.type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <TextInput
                type="text"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="Enter URL"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent Item (Optional)
            </label>
            <Select
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
            >
              <option value="">No Parent (Top Level)</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.label}
                </option>
              ))}
            </Select>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-3">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{item ? 'Update' : 'Create'}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

const MenuItemComponent: React.FC<{
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
}> = ({
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

const MenuBuilder: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItemNode | undefined>()

  const {
    menuItems,
    addItem,
    updateItem,
    deleteItem,
    moveUp,
    moveDown,
    indentRight,
    indentLeft,
    moveToParent,
  } = useMenuBuilderStore()

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const flattenItems = useCallback(
    (items: MenuItemNode[]): (MenuItemNode & { parentId?: string })[] => {
      const result: (MenuItemNode & { parentId?: string })[] = []
      const flatten = (items: MenuItemNode[], parentId?: string) => {
        items.forEach((item) => {
          result.push({ ...item, parentId })
          if (item.children.length > 0) {
            flatten(item.children, item.id)
          }
        })
      }
      flatten(items)
      return result
    },
    []
  )

  const findParentById = useCallback(
    (id: string, items: MenuItemNode[]): MenuItemNode | null => {
      for (const item of items) {
        if (item.children.some((child) => child.id === id)) return item
        if (item.children.length > 0) {
          const found = findParentById(id, item.children)
          if (found) return found
        }
      }
      return null
    },
    []
  )

  const handleSave = (
    formData: Omit<MenuItemNode, 'id' | 'children'> & { parentId?: string }
  ) => {
    if (editingItem) {
      // Update existing item
      updateItem(editingItem.id, formData)

      // If parent changed, move to new parent
      const currentParentId = findParentById(editingItem.id, menuItems)?.id
      if (formData.parentId !== currentParentId) {
        moveToParent(editingItem.id, formData.parentId)
      }
    } else {
      // Create new item
      const newItem = {
        id: generateId(),
        type: formData.type,
        label: formData.label,
        url: formData.url,
        parentId: formData.parentId || undefined,
      } as const
      addItem(newItem)
    }
  }

  const handleEdit = (item: MenuItemNode) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(undefined)
  }

  const canMoveUp = (id: string) => {
    const flatItems = flattenItems(menuItems)
    const currentIndex = flatItems.findIndex((item) => item.id === id)
    return currentIndex > 0
  }

  const canMoveDown = (id: string) => {
    const flatItems = flattenItems(menuItems)
    const currentIndex = flatItems.findIndex((item) => item.id === id)
    return currentIndex < flatItems.length - 1
  }

  const canIndentRight = (id: string) => {
    const flatItems = flattenItems(menuItems)
    const currentIndex = flatItems.findIndex((item) => item.id === id)
    return currentIndex > 0
  }

  const canIndentLeft = (id: string) => {
    const parent = findParentById(id, menuItems)
    return !!parent
  }

  const exportMenu = () => {
    const menuData = menuItems.map((item) => ({
      type: item.type,
      label: item.label,
      ...(item.url && { url: item.url }),
      children: item.children.map((child) => ({
        type: child.type,
        label: child.label,
        ...(child.url && { url: child.url }),
        children: [],
      })),
    }))

    const dataStr = JSON.stringify(menuData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'menu-structure.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Menu Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your website navigation menu structure
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button color="gray" onClick={exportMenu} size="sm">
            Export Menu
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <HiPlus className="mr-2" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              📋
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No menu items yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building your menu by adding your first menu item
            </p>
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              <HiPlus className="mr-2" />
              Add First Menu Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Menu Structure
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the controls to reorder and organize your menu items
              </p>
            </div>

            {menuItems.map((item, index) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                level={0}
                onEdit={handleEdit}
                onDelete={deleteItem}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onIndentRight={indentRight}
                onIndentLeft={indentLeft}
                canMoveUp={index > 0}
                canMoveDown={index < menuItems.length - 1}
                canIndentRight={index > 0}
                canIndentLeft={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        item={editingItem}
        allItems={flattenItems(menuItems)}
      />
    </div>
  )
}

export default MenuBuilder

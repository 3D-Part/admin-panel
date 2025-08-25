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

interface MenuItem {
  id: string
  type: 'link' | 'text'
  label: string
  url?: string
  children: MenuItem[]
  parentId?: string
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Omit<MenuItem, 'id' | 'children'>) => void
  item?: MenuItem
  allItems: MenuItem[]
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
                  type: e.target.value as 'link' | 'text',
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
  item: MenuItem
  level: number
  onEdit: (item: MenuItem) => void
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>()

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const flattenItems = useCallback((items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = []
    const flatten = (items: MenuItem[], parentId?: string) => {
      items.forEach((item) => {
        result.push({ ...item, parentId })
        if (item.children.length > 0) {
          flatten(item.children, item.id)
        }
      })
    }
    flatten(items)
    return result
  }, [])

  const findItemById = useCallback(
    (id: string, items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children.length > 0) {
          const found = findItemById(id, item.children)
          if (found) return found
        }
      }
      return null
    },
    []
  )

  const findParentById = useCallback(
    (id: string, items: MenuItem[]): MenuItem | null => {
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

  const updateItemInTree = useCallback(
    (id: string, updates: Partial<MenuItem>, items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates }
        }
        if (item.children.length > 0) {
          return {
            ...item,
            children: updateItemInTree(id, updates, item.children),
          }
        }
        return item
      })
    },
    []
  )

  const removeItemFromTree = useCallback(
    (id: string, items: MenuItem[]): MenuItem[] => {
      return items.filter((item) => {
        if (item.id === id) return false
        if (item.children.length > 0) {
          item.children = removeItemFromTree(id, item.children)
        }
        return true
      })
    },
    []
  )

  const handleSave = (formData: Omit<MenuItem, 'id' | 'children'>) => {
    if (editingItem) {
      // Update existing item
      setMenuItems((prev) => updateItemInTree(editingItem.id, formData, prev))
    } else {
      // Create new item
      const newItem: MenuItem = {
        id: generateId(),
        ...formData,
        children: [],
      }

      if (formData.parentId) {
        // Add as child to parent
        setMenuItems((prev) =>
          updateItemInTree(
            formData.parentId!,
            {
              children: [
                ...(findItemById(formData.parentId!, prev)?.children || []),
                newItem,
              ],
            },
            prev
          )
        )
      } else {
        // Add to top level
        setMenuItems((prev) => [...prev, newItem])
      }
    }
  }

  const handleDelete = (id: string) => {
    setMenuItems((prev) => removeItemFromTree(id, prev))
  }

  const handleMoveUp = (id: string) => {
    setMenuItems((prev) => {
      const flatItems = flattenItems(prev)
      const currentIndex = flatItems.findIndex((item) => item.id === id)
      if (currentIndex <= 0) return prev

      const currentItem = flatItems[currentIndex]
      const parent = findParentById(id, prev)

      if (parent) {
        // Moving within same parent
        const parentIndex = flatItems.findIndex((item) => item.id === parent.id)
        const siblings = parent.children
        const siblingIndex = siblings.findIndex((sibling) => sibling.id === id)

        if (siblingIndex > 0) {
          const newSiblings: MenuItem[] = [...siblings]
          const temp = newSiblings[siblingIndex]
          newSiblings[siblingIndex] = newSiblings[siblingIndex - 1]
          newSiblings[siblingIndex - 1] = temp

          return updateItemInTree(parent.id, { children: newSiblings }, prev)
        }
      } else {
        // Moving at top level
        const newItems: MenuItem[] = [...prev]
        const temp = newItems[currentIndex]
        newItems[currentIndex] = newItems[currentIndex - 1]
        newItems[currentIndex - 1] = temp
        return newItems
      }

      return prev
    })
  }

  const handleMoveDown = (id: string) => {
    setMenuItems((prev) => {
      const flatItems = flattenItems(prev)
      const currentIndex = flatItems.findIndex((item) => item.id === id)
      if (currentIndex >= flatItems.length - 1) return prev

      const currentItem = flatItems[currentIndex]
      const parent = findParentById(id, prev)

      if (parent) {
        // Moving within same parent
        const siblings = parent.children
        const siblingIndex = siblings.findIndex((sibling) => sibling.id === id)

        if (siblingIndex < siblings.length - 1) {
          const newSiblings: MenuItem[] = [...siblings]
          const temp = newSiblings[siblingIndex]
          newSiblings[siblingIndex] = newSiblings[siblingIndex + 1]
          newSiblings[siblingIndex + 1] = temp

          return updateItemInTree(parent.id, { children: newSiblings }, prev)
        }
      } else {
        // Moving at top level
        const newItems: MenuItem[] = [...prev]
        const temp = newItems[currentIndex]
        newItems[currentIndex] = newItems[currentIndex + 1]
        newItems[currentIndex + 1] = temp
        return newItems
      }

      return prev
    })
  }

  const handleIndentRight = (id: string) => {
    setMenuItems((prev) => {
      const flatItems = flattenItems(prev)
      const currentIndex = flatItems.findIndex((item) => item.id === id)
      if (currentIndex <= 0) return prev

      const currentItem = flatItems[currentIndex]
      const previousItem = flatItems[currentIndex - 1]

      if (!currentItem || !previousItem) return prev

      // Remove from current position
      const newItems = removeItemFromTree(id, prev)

      // Add as child to previous item
      return updateItemInTree(
        previousItem.id,
        {
          children: [
            ...(findItemById(previousItem.id, newItems)?.children || []),
            currentItem,
          ],
        },
        newItems
      )
    })
  }

  const handleIndentLeft = (id: string) => {
    setMenuItems((prev) => {
      const parent = findParentById(id, prev)
      if (!parent) return prev

      const grandParent = findParentById(parent.id, prev)
      const currentItem = findItemById(id, prev)

      if (!currentItem) return prev

      // Remove from current parent
      let newItems = updateItemInTree(
        parent.id,
        {
          children: parent.children.filter((child) => child.id !== id),
        },
        prev
      )

      if (grandParent) {
        // Add as sibling to parent
        newItems = updateItemInTree(
          grandParent.id,
          {
            children: [
              ...(findItemById(grandParent.id, newItems)?.children || []),
              currentItem,
            ],
          },
          newItems
        )
      } else {
        // Add to top level
        newItems = [...newItems, currentItem]
      }

      return newItems
    })
  }

  const handleEdit = (item: MenuItem) => {
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
          <div className="text-center py-12">
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
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onIndentRight={handleIndentRight}
                onIndentLeft={handleIndentLeft}
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

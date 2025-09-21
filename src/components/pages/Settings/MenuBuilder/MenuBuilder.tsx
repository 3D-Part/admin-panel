'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from 'flowbite-react'
import { HiPlus, HiUpload, HiDownload, HiSave } from 'react-icons/hi'
import { toast } from 'react-toastify'
import {
  useMenuBuilderStore,
  useCategoryStore,
  useManufactureStore,
} from '@/store/store'
import type { MenuItemNode } from '@/store/slices/menuBuilderSlice'
import EditModal from './components/EditModal'
import MenuItemComponent from './components/MenuItemComponent'

const MenuBuilder: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<
    (MenuItemNode & { parentId?: string }) | undefined
  >()

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
    setMenuItems,
  } = useMenuBuilderStore()

  const { fetchAllCategories } = useCategoryStore()
  const { fetchAllManufactures } = useManufactureStore()

  // File input ref for import functionality
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories and manufactures when component mounts
  useEffect(() => {
    fetchAllCategories()
    fetchAllManufactures()
  }, [fetchAllCategories, fetchAllManufactures])

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

  const exportMenu = useCallback(() => {
    // Recursive function to process menu items and their children
    const processMenuItem = (
      item: MenuItemNode
    ): {
      type: string
      label: string
      url?: string
      categorySlug?: string
      manufacturerId?: string
      children: any[]
    } => ({
      type: item.type,
      label: item.label,
      ...(item.url && { url: item.url }),
      ...(item.categorySlug && { categorySlug: item.categorySlug }),
      ...(item.manufacturerId && { manufacturerId: item.manufacturerId }),
      children: item.children.map(processMenuItem), // Recursively process children
    })

    const menuData = menuItems.map(processMenuItem)

    const dataStr = JSON.stringify(menuData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'menu-structure.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [menuItems])

  const importMenu = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const importedData = JSON.parse(content)

          // Validate the imported data structure
          if (!Array.isArray(importedData)) {
            alert('Invalid file format: Expected an array of menu items')
            return
          }

          // Process imported data and generate new IDs
          const processImportedItem = (item: any): MenuItemNode => ({
            id: generateId(), // Generate new ID for each item
            type: item.type || 'link',
            label: item.label || 'Imported Item',
            url: item.url || '',
            categorySlug: item.categorySlug || '',
            manufacturerId: item.manufacturerId || '',
            children: (item.children || []).map(processImportedItem),
          })

          const processedMenuItems = importedData.map(processImportedItem)

          // Set the imported menu items
          setMenuItems(processedMenuItems)

          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }

          alert(
            `Successfully imported ${processedMenuItems.length} menu items!`
          )
        } catch (error) {
          console.error('Error importing menu:', error)
          alert('Error importing menu: Invalid JSON format')
        }
      }

      reader.readAsText(file)
    },
    [setMenuItems]
  )

  const handleSave = (
    formData: Omit<MenuItemNode, 'id' | 'children'> & { parentId?: string }
  ) => {
    if (editingItem) {
      updateItem(editingItem.id, formData)
      const currentParentId = findParentById(editingItem.id, menuItems)?.id
      if (formData.parentId !== currentParentId) {
        moveToParent(editingItem.id, formData.parentId)
      }
    } else {
      const newItem = {
        id: generateId(),
        type: formData.type,
        label: formData.label,
        url: formData.url,
        categorySlug: formData.categorySlug,
        manufacturerId: formData.manufacturerId,
        parentId: formData.parentId || undefined,
      }
      addItem(newItem)
    }
  }

  const handleEdit = (item: MenuItemNode) => {
    // Find the parent ID for this item
    const parent = findParentById(item.id, menuItems)
    const itemWithParentId = {
      ...item,
      parentId: parent?.id,
    }
    setEditingItem(itemWithParentId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(undefined)
  }

  const handleSaveMenu = useCallback(() => {
    // TODO: Implement actual save functionality (API call)
    // For now, just show a success message
    toast('Menu structure saved successfully!', {
      hideProgressBar: true,
      autoClose: 2000,
      type: 'success',
    })
  }, [])

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="w-full flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="hidden md:flex flex-col flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Menu Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your website navigation menu structure
          </p>
        </div>
        <div className="flex items-center w-full md:w-auto justify-between gap-3 shrink-0">
          <Button
            className="hidden md:block"
            color="gray"
            onClick={exportMenu}
            size="sm"
          >
            <HiDownload className="mr-2" />
            Export
          </Button>

          <Button
            className="hidden md:block"
            onClick={importMenu}
            color="gray"
            size="sm"
          >
            <HiUpload className="mr-2" />
            Import
          </Button>

          <Button onClick={() => setIsModalOpen(true)} color="blue" size="sm">
            <HiPlus className="mr-2" />
            Add Menu Item
          </Button>

          <div className="h-4 mx-4" />

          <Button onClick={handleSaveMenu} color="purple" size="sm">
            <HiSave className="mr-2" />
            Save Menu
          </Button>
        </div>
      </div>

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

      {isModalOpen && (
        <EditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          item={editingItem}
          allItems={flattenItems(menuItems)}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />
    </div>
  )
}

export default MenuBuilder

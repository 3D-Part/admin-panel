import React, { useState, useRef, useEffect } from 'react'
import { Button, Modal, Select, TextInput } from 'flowbite-react'
import { useCategoryStore, useManufactureStore } from '@/store/store'
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
  const { allCategories } = useCategoryStore()
  const { allManufactures } = useManufactureStore()

  // Keep type in state since it controls conditional rendering
  const [type, setType] = useState<MenuItemType>(
    item?.type || 'category-manufacturer'
  )

  // Use refs for inputs that don't need re-renders
  const labelRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const parentIdRef = useRef<HTMLSelectElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const manufacturerRef = useRef<HTMLSelectElement>(null)

  // Update form values when item changes
  useEffect(() => {
    if (item) {
      setType(item.type)
      if (labelRef.current) labelRef.current.value = item.label
      if (urlRef.current) urlRef.current.value = item.url || ''
      if (parentIdRef.current) parentIdRef.current.value = item.parentId || ''
      if (categoryRef.current)
        categoryRef.current.value = item.categorySlug || ''
      if (manufacturerRef.current)
        manufacturerRef.current.value = item.manufacturerId || ''
    } else {
      setType('link')
      if (labelRef.current) labelRef.current.value = ''
      if (urlRef.current) urlRef.current.value = ''
      if (parentIdRef.current) parentIdRef.current.value = ''
      if (categoryRef.current) categoryRef.current.value = ''
      if (manufacturerRef.current) manufacturerRef.current.value = ''
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let url = ''
    let manufacturerId = ''

    if (type === 'category-manufacturer') {
      const categorySlug = categoryRef.current?.value
      const manufacturerIdValue = manufacturerRef.current?.value

      if (!categorySlug) {
        alert('Please select a category')
        return
      }

      // Manufacturer is optional - can be just category or category + manufacturer
      if (manufacturerIdValue) {
        url = `/shop/category/${categorySlug}?manufacturerId=${manufacturerIdValue}`
        manufacturerId = manufacturerIdValue
      } else {
        url = `/shop/category/${categorySlug}`
      }
    } else {
      url = urlRef.current?.value || ''
    }

    const formData = {
      type,
      label: labelRef.current?.value || '',
      url,
      categorySlug:
        type === 'category-manufacturer'
          ? categoryRef.current?.value
          : undefined,
      manufacturerId:
        type === 'category-manufacturer' ? manufacturerId : undefined,
      parentId: parentIdRef.current?.value || '',
    }

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
              value={type}
              onChange={(e) => setType(e.target.value as MenuItemType)}
            >
              <option value="link">Custom Link</option>
              <option value="text">Text Only</option>
              <option value="category-manufacturer">
                Category & Manufacturer
              </option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Label
            </label>
            <TextInput
              ref={labelRef}
              type="text"
              defaultValue={item?.label || ''}
              placeholder="Enter label"
              required
            />
          </div>

          {type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <TextInput
                ref={urlRef}
                type="text"
                defaultValue={item?.url || ''}
                placeholder="Enter URL"
                required
              />
            </div>
          )}

          {type === 'category-manufacturer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  ref={categoryRef}
                  defaultValue={item?.categorySlug || ''}
                >
                  <option value="">Select Category</option>
                  {allCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manufacturer (Optional)
                </label>
                <Select
                  ref={manufacturerRef}
                  defaultValue={item?.manufacturerId || ''}
                >
                  <option value="">No Manufacturer (Category Only)</option>
                  {allManufactures.map((manufacture) => (
                    <option key={manufacture.id} value={manufacture.id}>
                      {manufacture.name}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent Item (Optional)
            </label>
            <Select ref={parentIdRef} defaultValue={item?.parentId || ''}>
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

export default EditModal

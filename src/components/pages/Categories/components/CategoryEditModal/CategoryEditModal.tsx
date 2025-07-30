'use client'

import { Loader } from '@/components/common'
import {
  CategoryAttributeData,
  CategoryData,
  CategoryFormBody,
} from '@/shared/types'
import { useCategoryStore } from '@/store/store'
import {
  Button,
  Label,
  Modal,
  Select,
  TextInput,
  Textarea,
} from 'flowbite-react'
import { useEffect, useRef } from 'react'
import CategoryAttribute from '../../CategoryAttribute/CategoryAttribute'
import { CategoryAttributeAPI } from '@/services'

type ModalType = {
  isOpen: boolean
  initialValue?: CategoryData
  onSave: (category: CategoryFormBody) => void
  onClose: () => void
}

const CategoryEditModal: React.FC<ModalType> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
}) => {
  const categoryDataRef = useRef<CategoryData>({} as CategoryData)
  const categoryAttributeIds = useRef<string[]>([])

  const changeCategoryAttributeIds = (attributes: string[]) => {
    categoryAttributeIds.current = attributes
  }

  const { allCategories, fetchAllCategories } = useCategoryStore()
  const { addCategoryAttributesBulk, removeCategoryAttributesBulk } =
    CategoryAttributeAPI

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target

    categoryDataRef.current = {
      ...categoryDataRef.current,
      [name]: value,
    }
  }

  const resetData = () => {
    categoryDataRef.current = {} as CategoryData
  }

  const removeAttributesFromCategory = async () => {
    const initAttributeIds = initialValue?.categoryAttributes.map(
      (catAttribute) => {
        return catAttribute.id
      }
    )

    if (initAttributeIds && initAttributeIds?.length > 0) {
      await removeCategoryAttributesBulk(initAttributeIds)
    }
  }

  const updateAttributes = async (categoryId: string) => {
    const _data: CategoryAttributeData[] = []

    await removeAttributesFromCategory()
    if (categoryAttributeIds.current.length === 0) return

    categoryAttributeIds.current.forEach((attributeId) => {
      const _categoryAttribute = {
        categoryId: categoryId,
        attributeId: attributeId,
      }
      _data.push(_categoryAttribute)
    })

    await addCategoryAttributesBulk(_data)
  }

  const saveFunction = async () => {
    if (!categoryDataRef.current.name) return

    const _category: CategoryFormBody = {
      name: categoryDataRef.current.name,
      slug: categoryDataRef.current.slug,
      description: categoryDataRef.current.description
        ? categoryDataRef.current.description
        : '',
    }

    if (categoryDataRef.current.parentCategoryId) {
      _category.parentCategoryId = categoryDataRef.current.parentCategoryId
    }

    if (initialValue) {
      await updateAttributes(initialValue.id)
    }
    onSave(_category)
    resetData()
  }

  useEffect(() => {
    if (!initialValue) return

    categoryDataRef.current = initialValue
  }, [initialValue])

  useEffect(() => {
    if (allCategories.length > 0) return
    fetchAllCategories()
  }, [fetchAllCategories, allCategories])

  if (!isOpen) return null

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose} size="2xl">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              {initialValue ? 'Edit Category' : 'Add New Category'}
            </span>
            {initialValue && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {initialValue.name}
              </span>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          {allCategories.length > 0 ? (
            <form className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="categoryName"
                      value="Category Name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                      name="name"
                      onChange={handleInputChange}
                      id="categoryName"
                      required
                      type="text"
                      defaultValue={initialValue?.name ? initialValue.name : ''}
                      className="mt-1"
                      placeholder="Enter category name..."
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="urlSlug"
                      value="URL Slug"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                      name="slug"
                      onChange={handleInputChange}
                      id="urlSlug"
                      required
                      type="text"
                      defaultValue={initialValue?.slug ? initialValue.slug : ''}
                      className="mt-1"
                      placeholder="category-slug"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h3>
                <div>
                  <Label
                    htmlFor="description"
                    value="Category Description"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  />
                  <Textarea
                    onChange={handleInputChange}
                    defaultValue={
                      initialValue?.description ? initialValue?.description : ''
                    }
                    id="description"
                    name="description"
                    placeholder="Enter category description..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Parent Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Parent Category
                </h3>
                <div>
                  <Label
                    htmlFor="category"
                    value="Select Parent Category"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  />
                  <Select
                    onChange={handleInputChange}
                    name="parentCategoryId"
                    id="category"
                    defaultValue={
                      initialValue?.parentCategoryId
                        ? initialValue?.parentCategoryId
                        : ''
                    }
                    className="mt-1"
                  >
                    <option value={''}>No parent category</option>
                    {allCategories.map((category) => {
                      return (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      )
                    })}
                  </Select>
                </div>
              </div>

              {/* Attributes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Attributes
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CategoryAttribute
                    onAttributesChange={changeCategoryAttributeIds}
                    initialAttributes={initialValue?.categoryAttributes}
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              onClick={saveFunction}
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={!categoryDataRef.current.name}
            >
              {initialValue ? 'Update Category' : 'Create Category'}
            </Button>
            <Button
              color="gray"
              onClick={onClose}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CategoryEditModal

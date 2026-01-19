'use client'

import { Loader } from '@/components/common'
import { useAttributesStore, useProductsStore } from '@/store/store'
import { Button, Label, Select } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { AttributeData } from '@/shared/types'
import AddAttributeForm from './components/AddAttributeForm/AddAttributeForm'
import CategoriesAPI from '@/services/categories'

const AddAttribute = () => {
  const [loader, setLoader] = useState(false)
  const [categoryAttributes, setCategoryAttributes] = useState<AttributeData[]>(
    []
  )

  const [selectedAttribute, setSelectedAttribute] = useState<AttributeData>(
    {} as AttributeData
  )

  const { activeProduct } = useProductsStore()

  const productCategorySlug = activeProduct.category?.slug || ''

  const resetSelectedAttribute = () => {
    setSelectedAttribute({} as AttributeData)
  }
  const attributeDataRef = useRef<string>('')

  const getCategoryAttributes = async () => {
    if (!productCategorySlug) return

    setLoader(true)
    try {
      const categoryData =
        await CategoriesAPI.getCategoryBySlug(productCategorySlug)
      if (categoryData && categoryData.categoryAttributes) {
        const attributes = categoryData.categoryAttributes.map(
          (ca) => ca.attribute
        )
        setCategoryAttributes(attributes)
      }
    } catch (error) {
      console.error('Error fetching category attributes:', error)
      setCategoryAttributes([])
    }
    setLoader(false)
  }

  useEffect(() => {
    getCategoryAttributes()
  }, [productCategorySlug])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target

    attributeDataRef.current = value
  }

  const addAttribute = () => {
    const _selectedAttribute = categoryAttributes.find(
      (attribute) => attribute.id === attributeDataRef.current
    )
    _selectedAttribute && setSelectedAttribute(_selectedAttribute)
  }

  if (loader) return <Loader />
  if (!productCategorySlug) {
    return (
      <div className="mt-4 text-gray-900 dark:text-white text-xl">
        No category selected for this product
      </div>
    )
  }
  if (!categoryAttributes.length)
    return (
      <div className="mt-4 text-gray-900 dark:text-white text-xl">
        There are no attributes available for this category
      </div>
    )

  return (
    <div className="flex flex-wrap w-full ">
      <div className="w-full flex justify-start items-end gap-4">
        <div className="min-w-[200px]" id="select">
          <div className="mb-2 block">
            <Label htmlFor="attribute" value="Attribute" />
          </div>
          <Select
            onChange={handleInputChange}
            name="attributeId"
            id="attribute"
            // required
            // defaultValue={activeProduct.attributeId}
          >
            <option value={''}>None</option>
            {categoryAttributes.map((attribute) => {
              return (
                <option value={attribute.id} key={attribute.id}>
                  {attribute.name}
                </option>
              )
            })}
          </Select>
        </div>

        <Button onClick={addAttribute}>Add Attribute</Button>
      </div>

      {selectedAttribute.id && (
        <AddAttributeForm
          attribute={selectedAttribute}
          resetData={resetSelectedAttribute}
        />
      )}
    </div>
  )
}

export default AddAttribute

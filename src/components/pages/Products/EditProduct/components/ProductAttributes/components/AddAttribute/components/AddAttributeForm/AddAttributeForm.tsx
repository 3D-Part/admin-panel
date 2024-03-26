'use client'

import { ProductAttributeAPI, ProductsAPI } from '@/services'
import { AttributeData, CreateProductAttributeBody } from '@/shared/types'
import { useProductsStore } from '@/store/store'
import { Button, Label, Spinner, TextInput } from 'flowbite-react'
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'
import { toast } from 'react-toastify'

type AddAttributeFormType = {
  attribute: AttributeData
  resetData: () => void
}

const AddAttributeForm: React.FC<AddAttributeFormType> = ({
  attribute,
  resetData,
}) => {
  const [loader, setLoader] = useState(false)
  const attributeValue = useRef<string>()

  const { activeProduct, changeActiveProduct } = useProductsStore()

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { value } = e.target

    attributeValue.current = value
  }

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!attributeValue.current) return

    const _body: CreateProductAttributeBody = {
      attributeId: attribute.id,
      productId: activeProduct.id,
      value: attributeValue.current,
    }

    setLoader(true)
    const data = await ProductAttributeAPI.addProductAttribute(_body)
    if (data) {
      const toastMessage = `product attribute is created`
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    const _productData = await ProductsAPI.getOneProduct(activeProduct.id)
    if (_productData) {
      changeActiveProduct(_productData)
    }
    setLoader(false)
    if (data) resetData()
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="w-full flex flex-wrap gap-4 justify-start items-center mt-8">
          <h3 className="text-lg leading-none tracking-tight text-gray-800 dark:text-white">
            Enter value ({attribute.name}):{' '}
          </h3>
          <div className="mb-2 block">
            <Label
              className="text-base"
              htmlFor="attribute-value"
              defaultValue="Attribute value"
            />
          </div>
          <TextInput
            name="attribute-value"
            onChange={handleInputChange}
            id="attribute-value"
            required
            type="text"
          />
          <div className="flex justify-start items-center gap-4">
            <Button type="submit">
              <HiCheckCircle className="h-5 w-5" />
            </Button>
            <Button onClick={resetData} color="light">
              <HiXCircle className="h-5 w-5" />
            </Button>
            {loader && (
              <Spinner aria-label="Success spinner example" color="success" />
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddAttributeForm

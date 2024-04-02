'use client'

import {
  PaginationData,
  ProductOnSaleData,
  SalesFormData,
} from '@/shared/types'
import {
  useProductsStore,
  useSalesSliceStore,
  useUISliceStore,
} from '@/store/store'
import { SalesAPI } from '@/services'

import { Button, Label, Modal, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const AddProductsOnSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const { activeProduct } = useProductsStore()

  const { changeIsAddProductsOnSaleModalOpen, isAddProductsOnSaleModalOpen } =
    useUISliceStore()
  const { allSales } = useSalesSliceStore()

  const salesDataRef = useRef<ProductOnSaleData>({} as ProductOnSaleData)
  const formRef = useRef<HTMLFormElement>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    const _value = name === 'discountedPrice' ? Number(value) : value

    salesDataRef.current = {
      ...salesDataRef.current,
      [name]: _value,
    }
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    salesDataRef.current = {} as ProductOnSaleData
  }

  const closeModal = () => {
    changeIsAddProductsOnSaleModalOpen(false)
  }

  const onSave = async () => {
    salesDataRef.current.productId = activeProduct.id
    console.log('salesDataRef.current:', salesDataRef.current)

    setLoading(true)

    const body = [salesDataRef.current]

    const response = await SalesAPI.addProductOnSale(body)
    console.log('response:', response)
    if (response) {
      toast('Product is added on sale', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    // fetchSalesData()
    setLoading(false)
    changeIsAddProductsOnSaleModalOpen(false)
  }

  useEffect(() => {
    resetData()
  }, [isAddProductsOnSaleModalOpen])

  return (
    <Modal dismissible show={isAddProductsOnSaleModalOpen} onClose={closeModal}>
      <Modal.Header>
        <div className="flex items-center justify-center gap-2">
          Add <i>&quot;{activeProduct.name}&quot;</i> on sale
        </div>
      </Modal.Header>
      <Modal.Body>
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-md flex-col gap-4"
        >
          {/* SALES */}
          <div className="w-full" id="select">
            <div className="mb-2 block">
              <Label htmlFor="saleId" value="Sale" />
            </div>
            <Select
              onChange={handleInputChange}
              name="saleId"
              id="saleId"
              required
            >
              <option value={''}>None</option>
              {allSales.map((sale) => {
                return (
                  <option value={sale.id} key={sale.id}>
                    {sale.name}
                  </option>
                )
              })}
            </Select>
          </div>
          {/* Discount */}
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="discountedPrice" value="Discount price" />
            </div>
            <TextInput
              name="discountedPrice"
              onChange={handleInputChange}
              id="discountedPrice"
              required
              type="text"
              defaultValue=""
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button isProcessing={loading} disabled={loading} onClick={onSave}>
          Save
        </Button>

        <Button disabled={loading} color="gray" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddProductsOnSaleModal

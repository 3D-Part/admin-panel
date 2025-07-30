'use client'

import {
  DeleteProductsOnSaleFormData,
  PatchProductOnSaleData,
  ProductOnSale,
  ProductOnSaleData,
  Sale,
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
import { useModalScroll } from '@/shared/hooks/useModalScroll'

const AddProductsOnSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const [productOnSelectedSale, setProductOnSelectedSale] =
    useState<ProductOnSale | null>(null)

  const { activeProduct } = useProductsStore()

  const { changeIsAddProductsOnSaleModalOpen, isAddProductsOnSaleModalOpen } =
    useUISliceStore()
  const { allSales, activeSale, changeActiveSale, fetchAllSales } =
    useSalesSliceStore()

  const salesDataRef = useRef<ProductOnSaleData>({} as ProductOnSaleData)
  const formRef = useRef<HTMLFormElement>(null)

  const changeActiveSaleData = (saleId: string) => {
    const selectedSale = allSales.find((sale) => sale.id === saleId)

    if (selectedSale) {
      changeActiveSale(selectedSale)
    } else {
      changeActiveSale({} as Sale)
    }
  }

  const checkIsProductInSelectedSale = () => {
    if (!activeSale?.id) {
      setProductOnSelectedSale(null)
      return
    }
    const productOnSale = activeSale?.productOnSale.find((product) => {
      return product.productId === activeProduct.id
    })

    if (productOnSale) {
      setProductOnSelectedSale(productOnSale)
    } else {
      setProductOnSelectedSale(null)
    }
  }

  useEffect(() => {
    if (!isAddProductsOnSaleModalOpen) return
    checkIsProductInSelectedSale()
  }, [activeSale])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    const _value = name === 'discountedPrice' ? Number(value) : value

    salesDataRef.current = {
      ...salesDataRef.current,
      [name]: _value,
    }

    if (name === 'saleId') {
      changeActiveSaleData(value)
      // checkIsProductInSelectedSale()
    }
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    salesDataRef.current = {} as ProductOnSaleData
    setProductOnSelectedSale(null)
  }

  const closeModal = () => {
    changeIsAddProductsOnSaleModalOpen(false)
  }

  const onSave = async () => {
    salesDataRef.current.productId = activeProduct.id

    setLoading(true)

    let response
    let message = ''
    if (productOnSelectedSale) {
      const patchBody: PatchProductOnSaleData[] = [
        {
          id: productOnSelectedSale.id,
          discountedPrice: salesDataRef.current.discountedPrice,
        },
      ]
      message = 'Product on sale is changed'
      response = await SalesAPI.updateProductOnSale(patchBody)
    } else {
      const addBody = [salesDataRef.current]
      message = 'Product is added on sale'
      response = await SalesAPI.addProductOnSale(addBody)
    }

    if (response) {
      toast(message, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    await fetchAllSales()
    setLoading(false)
    changeIsAddProductsOnSaleModalOpen(false)
  }

  const onDelete = async () => {
    if (!productOnSelectedSale) return
    setLoading(true)

    const body: DeleteProductsOnSaleFormData = {
      ids: [productOnSelectedSale.id],
    }

    const response = await SalesAPI.deleteProductOnSale(body)
    if (response) {
      toast('Product is remove from sale', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'warning',
      })
    }
    changeActiveSale({} as Sale)
    await fetchAllSales()
    setLoading(false)
  }

  useEffect(() => {
    resetData()
  }, [isAddProductsOnSaleModalOpen])

  // Disable body scroll when modal is open
  useModalScroll(isAddProductsOnSaleModalOpen)

  return (
    <Modal
      dismissible
      show={isAddProductsOnSaleModalOpen}
      onClose={closeModal}
      size="lg"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            Add Product to Sale
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            "{activeProduct.name}"
          </span>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6">
        <form ref={formRef} className="space-y-6">
          {/* Sale Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sale Selection
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="saleId"
                  value={`Select Sale ${
                    productOnSelectedSale
                      ? '(product is already in this sale)'
                      : ''
                  }`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <Select
                  onChange={handleInputChange}
                  name="saleId"
                  id="saleId"
                  required
                  className="mt-1"
                >
                  <option value={''}>Select a sale...</option>
                  {allSales.map((sale) => {
                    return (
                      <option value={sale.id} key={sale.id}>
                        {sale.name}
                      </option>
                    )
                  })}
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pricing
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="discountedPrice"
                  value="Discounted Price"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <TextInput
                  name="discountedPrice"
                  onChange={handleInputChange}
                  id="discountedPrice"
                  required
                  type="number"
                  defaultValue={
                    productOnSelectedSale
                      ? productOnSelectedSale.discountedPrice
                      : ''
                  }
                  className="mt-1"
                  placeholder="Enter discounted price..."
                />
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            isProcessing={loading}
            disabled={loading}
            onClick={onSave}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            {productOnSelectedSale ? 'Update Price' : 'Add to Sale'}
          </Button>
          {productOnSelectedSale && (
            <Button
              color="red"
              isProcessing={loading}
              disabled={loading}
              onClick={onDelete}
              className="w-full sm:w-auto order-2"
            >
              Remove from Sale
            </Button>
          )}
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="w-full sm:w-auto order-1 sm:order-3"
          >
            Cancel
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default AddProductsOnSaleModal

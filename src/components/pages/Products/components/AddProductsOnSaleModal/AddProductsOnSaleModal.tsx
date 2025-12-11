'use client'

import {
  DeleteProductsOnSaleFormData,
  PatchProductOnSaleData,
  ProductOnSale,
  ProductOnSaleData,
  Sale,
  PaginationData,
} from '@/shared/types'
import {
  useProductsStore,
  useSalesSliceStore,
  useUISliceStore,
} from '@/store/store'
import { SalesAPI } from '@/services'

import { Button, Label, Modal, Select, TextInput } from 'flowbite-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

const AddProductsOnSaleModal = () => {
  const [loading, setLoading] = useState(false)
  const [discountedPrice, setDiscountedPrice] = useState<string>('')

  const [productOnSelectedSale, setProductOnSelectedSale] =
    useState<ProductOnSale | null>(null)

  const { activeProduct, fetchProducts, currentPage, itemsPerPage } =
    useProductsStore()

  const { changeIsAddProductsOnSaleModalOpen, isAddProductsOnSaleModalOpen } =
    useUISliceStore()

  const { allSales, activeSale, changeActiveSale, fetchAllSales } =
    useSalesSliceStore()

  const salesDataRef = useRef<ProductOnSaleData>({} as ProductOnSaleData)
  const formRef = useRef<HTMLFormElement>(null)

  const refetchProducts = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchProducts(paginationData)
  }

  const changeActiveSaleData = (saleId: string) => {
    const selectedSale = allSales.find((sale) => sale.id === saleId)

    if (selectedSale) {
      changeActiveSale(selectedSale)
    } else {
      changeActiveSale({} as Sale)
    }
  }

  const checkIsProductInSelectedSale = useCallback(() => {
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
  }, [activeSale, activeProduct.id])

  useEffect(() => {
    if (!isAddProductsOnSaleModalOpen) return
    checkIsProductInSelectedSale()
  }, [activeSale, isAddProductsOnSaleModalOpen, checkIsProductInSelectedSale])

  useEffect(() => {
    if (productOnSelectedSale) {
      setDiscountedPrice(productOnSelectedSale.discountedPrice.toString())
    } else {
      setDiscountedPrice('')
    }
  }, [productOnSelectedSale])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    const _value = name === 'discountedPrice' ? Number(value) : value

    salesDataRef.current = {
      ...salesDataRef.current,
      [name]: _value,
    }

    if (name === 'discountedPrice') {
      setDiscountedPrice(value)
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
    setDiscountedPrice('')
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
    await refetchProducts()
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
    await refetchProducts()
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
      size="2xl"
      className="max-h-[95vh] overflow-hidden"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white text-lg">
                {productOnSelectedSale
                  ? 'Update Sale Price'
                  : 'Add Product to Sale'}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {activeProduct.name}
              </p>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6 sm:space-y-8 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
        <form ref={formRef} className="space-y-6 sm:space-y-8">
          {/* Product Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Product Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label
                  htmlFor="productName"
                  value="Product Name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                />
                <TextInput
                  id="productName"
                  value={activeProduct.name || ''}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <div>
                <Label
                  htmlFor="currentPrice"
                  value="Current Price"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                />
                <div className="relative">
                  <TextInput
                    id="currentPrice"
                    value={
                      activeProduct.price ? `${activeProduct.price} KM` : ''
                    }
                    disabled
                    className="w-full bg-gray-100 dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sale Selection */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Sale Selection
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="saleId"
                  value="Select Sale"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                />
                <Select
                  onChange={handleInputChange}
                  name="saleId"
                  id="saleId"
                  required
                  className="w-full"
                >
                  <option value={''}>Choose a sale...</option>
                  {allSales.map((sale) => {
                    return (
                      <option value={sale.id} key={sale.id}>
                        {sale.name}
                      </option>
                    )
                  })}
                </Select>
                {productOnSelectedSale && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        This product is already in the selected sale
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Sale Pricing
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="discountedPrice"
                  value="Discounted Price"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                />
                <div className="relative">
                  <TextInput
                    name="discountedPrice"
                    onChange={handleInputChange}
                    id="discountedPrice"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountedPrice}
                    className="w-full"
                    placeholder="Enter discounted price..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-row gap-2 sm:gap-3 w-full">
          <Button
            isProcessing={loading}
            disabled={loading}
            onClick={onSave}
            className="flex-1 sm:w-auto order-1 h-10 touch-manipulation"
            size="sm"
            color="purple"
          >
            {productOnSelectedSale ? 'Update Price' : 'Add to Sale'}
          </Button>
          {productOnSelectedSale && (
            <Button
              color="red"
              isProcessing={loading}
              disabled={loading}
              onClick={onDelete}
              className="flex-1 sm:w-auto order-2 h-10 touch-manipulation"
              size="sm"
            >
              Remove from Sale
            </Button>
          )}
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="flex-1 sm:w-auto order-3 h-10 touch-manipulation sm:flex-none"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default AddProductsOnSaleModal

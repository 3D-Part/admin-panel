'use client'

import isoToDatetimeLocal from '@/shared/helpers/isoToDatetimeLocal'
import { PaginationData, SalesFormData } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'
import SalesAPI from '@/services/sales'

const EditSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const { changeIsSaleEditModalOpen, isSaleEditModalOpen } = useUISliceStore()
  const {
    activeSale,
    editSale,
    removeSale,
    removeProductFromActiveSale,
    currentPage,
    itemsPerPage,
    fetchSales,
  } = useSalesSliceStore()

  const salesDataRef = useRef<SalesFormData>({} as SalesFormData)
  const formRef = useRef<HTMLFormElement>(null)

  const startTimeFormated = isoToDatetimeLocal(
    activeSale?.startsAt ? activeSale?.startsAt : ''
  )
  const endTimeFormated = isoToDatetimeLocal(
    activeSale?.endsAt ? activeSale?.endsAt : ''
  )

  const fetchSalesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchSales(paginationData)
    setLoading(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    salesDataRef.current = {
      ...salesDataRef.current,
      [name]: value,
    }
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    salesDataRef.current = {} as SalesFormData
  }

  const closeModal = () => {
    changeIsSaleEditModalOpen(false)
  }

  const onSave = async () => {
    if (!activeSale?.id) return

    setLoading(true)

    const response = await editSale(activeSale.id, salesDataRef.current)

    if (response) {
      toast('Sale is updated', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }

    await fetchSalesData()
    setLoading(false)
    changeIsSaleEditModalOpen(false)
  }

  const onRemove = async () => {
    if (!activeSale?.id) return

    setLoading(true)
    const response = await removeSale(activeSale.id)

    if (response) {
      toast('Sale is removed', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })

      resetData()
      // setLoading(false)
      fetchSalesData()
      changeIsSaleEditModalOpen(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    if (!activeSale?.id) return

    setLoading(true)
    try {
      const response = await SalesAPI.deleteProductOnSale({
        ids: [productId],
      })

      if (response) {
        // Manually remove the product from the active sale in the slice
        removeProductFromActiveSale(productId)

        toast('Product removed from sale', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
        })
      } else {
        toast('Failed to remove product from sale', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
        })
      }
    } catch (error) {
      toast('Failed to remove product from sale', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    resetData()
    if (activeSale?.id) {
      salesDataRef.current = {
        name: activeSale.name,
        startsAt: activeSale.startsAt,
        endsAt: activeSale.endsAt,
      }
    }
  }, [activeSale])

  // Disable body scroll when modal is open
  useModalScroll(isSaleEditModalOpen)

  return (
    <Modal
      dismissible
      show={isSaleEditModalOpen}
      onClose={closeModal}
      size="4xl"
      className="max-h-[95vh] overflow-hidden"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
          <span className="font-semibold text-gray-900 dark:text-white text-lg">
            Edit Sale
          </span>
          {activeSale?.name && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {activeSale.name}
            </span>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6 sm:space-y-8 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
        <form ref={formRef} className="space-y-6 sm:space-y-8">
          {/* Sale Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sale Information
            </h3>
            <div>
              <Label
                htmlFor="name"
                value="Sale Name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
              />
              <TextInput
                name="name"
                onChange={handleInputChange}
                id="name"
                required
                type="text"
                defaultValue={activeSale?.name ? activeSale.name : ''}
                placeholder="Enter sale name..."
                className="w-full"
              />
            </div>
          </div>

          {/* Sale Period */}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Sale Period
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* START DATE */}
              <div>
                <Label
                  htmlFor="startsAt"
                  value="Start Date & Time"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                />
                <TextInput
                  name="startsAt"
                  onChange={handleInputChange}
                  id="startsAt"
                  required
                  type="datetime-local"
                  defaultValue={startTimeFormated}
                  className="w-full"
                />
              </div>

              {/* END DATE */}
              <div>
                <Label
                  htmlFor="endsAt"
                  value="End Date & Time"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                />
                <TextInput
                  name="endsAt"
                  onChange={handleInputChange}
                  id="endsAt"
                  required
                  type="datetime-local"
                  defaultValue={endTimeFormated}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Products on Sale */}
          {activeSale && activeSale?.productOnSale?.length > 0 && (
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Products on Sale ({activeSale.productOnSale.length})
              </h3>
              <div className="grid gap-2 sm:gap-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {activeSale.productOnSale.map((product) => {
                  const discountPercentage = Math.round(
                    ((Number(product.product.price) -
                      Number(product.discountedPrice)) /
                      Number(product.product.price)) *
                      100
                  )

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200"
                    >
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {product.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          ID: {product.product.id}
                        </p>
                      </div>

                      {/* Discount Badge */}
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          -{discountPercentage}%
                        </span>
                      </div>

                      {/* Price Info */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs sm:text-sm line-through text-gray-400 dark:text-gray-500">
                            {product.product.price} KM
                          </span>
                          <span className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
                            {product.discountedPrice} KM
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                            Save{' '}
                            {Number(product.product.price) -
                              Number(product.discountedPrice)}{' '}
                            KM
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="p-2 sm:p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 touch-manipulation"
                          title="Remove from sale"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-row sm:flex-row gap-2 sm:gap-3 w-full">
          <Button
            isProcessing={loading}
            disabled={loading}
            onClick={onSave}
            className="flex-1 sm:w-auto order-1 h-10 touch-manipulation"
            size="sm"
            color="purple"
          >
            Update Sale
          </Button>
          <Button
            isProcessing={loading}
            color="red"
            onClick={onRemove}
            className="flex-1 sm:w-auto order-2 h-10 touch-manipulation"
            size="sm"
          >
            Remove Sale
          </Button>
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="hidden sm:block sm:w-auto order-3 h-10 touch-manipulation"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default EditSaleModal

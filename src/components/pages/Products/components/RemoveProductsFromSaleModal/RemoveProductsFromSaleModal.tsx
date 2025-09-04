'use client'

import { DeleteProductsOnSaleFormData, PaginationData } from '@/shared/types'
import {
  useProductsStore,
  useSalesSliceStore,
  useUISliceStore,
} from '@/store/store'
import { SalesAPI } from '@/services'

import { Button, Modal, Checkbox } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

const RemoveProductsFromSaleModal = () => {
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { activeProduct, fetchProducts, currentPage, itemsPerPage } =
    useProductsStore()

  const {
    changeIsRemoveProductsFromSaleModalOpen,
    isRemoveProductsFromSaleModalOpen,
  } = useUISliceStore()

  const { fetchAllSales } = useSalesSliceStore()

  const refetchProducts = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchProducts(paginationData)
  }

  const closeModal = () => {
    changeIsRemoveProductsFromSaleModalOpen(false)
    setSelectedIds([])
  }

  const handleCheckboxChange = (
    productOnSaleId: string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedIds((prev) => [...prev, productOnSaleId])
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== productOnSaleId))
    }
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked && activeProduct && activeProduct.productOnSale) {
      setSelectedIds(activeProduct.productOnSale.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const onRemove = async () => {
    if (selectedIds.length === 0) {
      toast('Please select at least one sale to remove the product from', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'warning',
      })
      return
    }

    setLoading(true)

    const body: DeleteProductsOnSaleFormData = {
      ids: selectedIds,
    }

    const response = await SalesAPI.deleteProductOnSale(body)
    if (response) {
      toast(`Product removed from ${selectedIds.length} sale(s)`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      await fetchAllSales()
      await refetchProducts()
      closeModal()
    } else {
      toast('Failed to remove product from sales', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    if (isRemoveProductsFromSaleModalOpen) {
      setSelectedIds([])
    }
  }, [isRemoveProductsFromSaleModalOpen])

  // Disable body scroll when modal is open
  useModalScroll(isRemoveProductsFromSaleModalOpen)

  const isAllSelected =
    activeProduct &&
    activeProduct.productOnSale &&
    activeProduct.productOnSale.length > 0 &&
    selectedIds.length === activeProduct.productOnSale.length

  return (
    <Modal
      dismissible
      show={isRemoveProductsFromSaleModalOpen}
      onClose={closeModal}
      size="lg"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            Remove Product from Sales
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activeProduct?.name || 'Unknown Product'}
          </span>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6">
        {!activeProduct ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No product selected.
            </p>
          </div>
        ) : activeProduct.productOnSale &&
          activeProduct.productOnSale.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              This product is not currently on any sales.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Select All ({activeProduct?.productOnSale?.length || 0} sales)
                </label>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeProduct?.productOnSale?.map((productOnSale) => {
                const isSelected = selectedIds.includes(productOnSale.id)

                return (
                  <div
                    key={productOnSale.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={productOnSale.id}
                        checked={isSelected}
                        onChange={(e) =>
                          handleCheckboxChange(
                            productOnSale.id,
                            e.target.checked
                          )
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-gray-900 dark:text-white font-bold">
                              {productOnSale.sale.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Discounted Price: {productOnSale.discountedPrice}{' '}
                              KM
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Added:{' '}
                              {new Date(
                                productOnSale.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {activeProduct &&
            activeProduct.productOnSale &&
            activeProduct.productOnSale.length > 0 && (
              <Button
                color="red"
                isProcessing={loading}
                disabled={loading || selectedIds.length === 0}
                onClick={onRemove}
                className="w-full sm:w-auto order-1"
              >
                Remove from{' '}
                {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}Sale
                {selectedIds.length !== 1 ? 's' : ''}
              </Button>
            )}
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="w-full sm:w-auto order-2"
          >
            Cancel
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default RemoveProductsFromSaleModal

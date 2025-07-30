'use client'

import isoToDatetimeLocal from '@/shared/helpers/isoToDatetimeLocal'
import { PaginationData, SalesFormData } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

const EditSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const { changeIsSaleEditModalOpen, isSaleEditModalOpen } = useUISliceStore()
  const {
    activeSale,
    editSale,
    removeSale,
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
    const data = await fetchSales(paginationData)
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
      size="lg"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            Edit Sale
          </span>
          {activeSale?.name && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activeSale.name}
            </span>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6">
        <form ref={formRef} className="space-y-6">
          {/* Sale Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sale Information
            </h3>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label
                  htmlFor="name"
                  value="Sale Name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <TextInput
                  name="name"
                  onChange={handleInputChange}
                  id="name"
                  required
                  type="text"
                  defaultValue={activeSale?.name ? activeSale.name : ''}
                  className="mt-1"
                  placeholder="Enter sale name..."
                />
              </div>
            </div>
          </div>

          {/* Sale Period */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sale Period
            </h3>
            <div className="space-y-4">
              {/* START DATE */}
              <div>
                <Label
                  htmlFor="startsAt"
                  value="Start Date & Time"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <TextInput
                  name="startsAt"
                  onChange={handleInputChange}
                  id="startsAt"
                  required
                  type="datetime-local"
                  defaultValue={startTimeFormated}
                  className="mt-1"
                />
              </div>

              {/* END DATE */}
              <div>
                <Label
                  htmlFor="endsAt"
                  value="End Date & Time"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <TextInput
                  name="endsAt"
                  onChange={handleInputChange}
                  id="endsAt"
                  required
                  type="datetime-local"
                  defaultValue={endTimeFormated}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Products on Sale */}
          {activeSale && activeSale?.productOnSale?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Products on Sale ({activeSale.productOnSale.length})
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  {activeSale.productOnSale.map((product) => {
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.product.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-red-400">
                            {product.product.price} KM
                          </span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {product.discountedPrice} KM
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
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
            Update Sale
          </Button>
          <Button
            isProcessing={loading}
            color="red"
            onClick={onRemove}
            className="w-full sm:w-auto order-2"
          >
            Remove Sale
          </Button>
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

export default EditSaleModal

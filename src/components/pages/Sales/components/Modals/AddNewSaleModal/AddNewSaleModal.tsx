'use client'

import { PaginationData, SalesFormData } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const AddNewSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const { changeIsSaleAddNewModalOpen, isSaleAddNewModalOpen } =
    useUISliceStore()
  const { addNewSale, fetchSales, currentPage, itemsPerPage } =
    useSalesSliceStore()

  const fetchSalesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchSales(paginationData)
  }

  const salesDataRef = useRef<SalesFormData>({} as SalesFormData)
  const formRef = useRef<HTMLFormElement>(null)

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
    changeIsSaleAddNewModalOpen(false)
  }

  const onSave = async () => {
    setLoading(true)

    const response = await addNewSale(salesDataRef.current)

    if (response) {
      toast('Sale is created', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    fetchSalesData()
    setLoading(false)
    changeIsSaleAddNewModalOpen(false)
  }

  useEffect(() => {
    resetData()
  }, [isSaleAddNewModalOpen])

  return (
    <Modal
      dismissible
      show={isSaleAddNewModalOpen}
      onClose={closeModal}
      size="lg"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            Add New Sale
          </span>
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
                  defaultValue=""
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
                  defaultValue=""
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
                  defaultValue=""
                  className="mt-1"
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
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Create Sale
          </Button>
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Cancel
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default AddNewSaleModal

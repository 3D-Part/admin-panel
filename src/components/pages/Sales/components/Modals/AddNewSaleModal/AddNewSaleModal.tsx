'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { datetimeLocalToIso } from '@/shared/helpers/isoToDatetimeLocal'

import { PaginationData, SalesFormData } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'
import { nextSaleColor } from '@/shared/helpers/saleTags'
import SaleColorPicker from '../SaleColorPicker'

const AddNewSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const {
    changeIsSaleAddNewModalOpen,
    changeIsSaleEditModalOpen,
    isSaleAddNewModalOpen,
  } = useUISliceStore()
  const {
    addNewSale,
    changeActiveSale,
    fetchSales,
    currentPage,
    itemsPerPage,
    currentPageSales,
  } = useSalesSliceStore()
  // the colors the other sales have, so a new one gets a different one
  const takenColors = currentPageSales
    .map((sale) => sale.color)
    .filter((color): color is string => !!color)
  const [color, setColor] = useState(nextSaleColor(takenColors))

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

    const response = await addNewSale({
      ...salesDataRef.current,
      color,
      startsAt: datetimeLocalToIso(salesDataRef.current.startsAt),
      endsAt: datetimeLocalToIso(salesDataRef.current.endsAt),
    })

    if (response) {
      toast(tx("Sale is created"), {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    fetchSalesData()
    setLoading(false)
    changeIsSaleAddNewModalOpen(false)

    // the next thing to do with a new sale is to put products on it
    if (response) {
      changeActiveSale({ ...response, productOnSale: response.productOnSale ?? [] })
      changeIsSaleEditModalOpen(true)
    }
  }

  useEffect(() => {
    resetData()
    if (isSaleAddNewModalOpen) setColor(nextSaleColor(takenColors))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaleAddNewModalOpen])

  // Disable body scroll when modal is open
  useModalScroll(isSaleAddNewModalOpen)

  return (
    <Modal root={modalRoot()}
      dismissible
      show={isSaleAddNewModalOpen}
      onClose={closeModal}
      size="lg"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            {tx("Add New Sale")}
          </span>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6">
        <form ref={formRef} className="space-y-6">
          {/* Sale Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {tx("Sale Information")}
            </h3>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label
                  htmlFor="name"
                  value={tx("Sale Name")}
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
                  placeholder={tx("Enter sale name...")}
                />
              </div>
              <SaleColorPicker value={color} onChange={setColor} taken={takenColors} />
            </div>
          </div>

          {/* Sale Period */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {tx("Sale Period")}
            </h3>
            <div className="space-y-4">
              {/* START DATE */}
              <div>
                <Label
                  htmlFor="startsAt"
                  value={tx("Start Date & Time")}
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
                  value={tx("End Date & Time")}
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
            {tx("Create Sale")}
          </Button>
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {tx("Cancel")}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default AddNewSaleModal

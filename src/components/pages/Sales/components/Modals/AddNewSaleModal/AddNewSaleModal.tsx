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
    <Modal dismissible show={isSaleAddNewModalOpen} onClose={closeModal}>
      <Modal.Header>
        <div className="flex items-center justify-center gap-2">
          Add new Sale
        </div>
      </Modal.Header>
      <Modal.Body>
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-md flex-col gap-4"
        >
          {/* Name */}
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="name" value="Name" />
            </div>
            <TextInput
              name="name"
              onChange={handleInputChange}
              id="name"
              required
              type="text"
              defaultValue=""
            />
          </div>

          {/* START DATE */}
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="startsAt" value="Start time" />
            </div>
            <TextInput
              name="startsAt"
              onChange={handleInputChange}
              id="startsAt"
              required
              type="datetime-local"
              defaultValue=""
            />
          </div>

          {/* END DATE */}
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="endsAt" value="End time" />
            </div>
            <TextInput
              name="endsAt"
              onChange={handleInputChange}
              id="endsAt"
              required
              type="datetime-local"
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

export default AddNewSaleModal

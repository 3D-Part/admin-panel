'use client'

import isoToDatetimeLocal from '@/shared/helpers/isoToDatetimeLocal'
import { PaginationData, SalesFormData } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

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

  return (
    <Modal dismissible show={isSaleEditModalOpen} onClose={closeModal}>
      <Modal.Header>
        <div className="flex items-center justify-center gap-2">
          {activeSale?.name ? activeSale.name : 'Sale'}
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
              defaultValue={activeSale?.name ? activeSale.name : ''}
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
              defaultValue={startTimeFormated}
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
              defaultValue={endTimeFormated}
            />
          </div>

          {activeSale && activeSale?.productOnSale?.length > 0 && (
            <div className="w-full ">
              <div className="mb-2 block">
                <Label value="Products on sale" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {activeSale.productOnSale.map((product) => {
                  return (
                    <p className="dark:text-white text-sm" key={product.id}>
                      <b>{product.product.name}</b>
                      <span className="line-through text-red-400 ml-2 mr-1">
                        {product.product.price}
                      </span>
                      <span className="text-green-400">
                        {product.discountedPrice},
                      </span>
                    </p>
                  )
                })}
              </div>
            </div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button isProcessing={loading} disabled={loading} onClick={onSave}>
          Save
        </Button>
        <Button isProcessing={loading} color="purple" onClick={onRemove}>
          Remove
        </Button>
        <Button disabled={loading} color="gray" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EditSaleModal

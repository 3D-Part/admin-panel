'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'

import isoToDatetimeLocal, { datetimeLocalToIso } from '@/shared/helpers/isoToDatetimeLocal'
import SaleProductSearch from './SaleProductSearch'
import { PaginationData, SalesFormData } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'
import SalesAPI from '@/services/sales'
import SaleProductsList from './SaleProductsList'
import SaleColorPicker from '../SaleColorPicker'
import { DEFAULT_SALE_COLOR, refreshSaleTags, saleTiming } from '@/shared/helpers/saleTags'
import { useEnterSave } from '@/shared/hooks/useEnterSave'

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
    currentPageSales,
    changeActiveSale,
  } = useSalesSliceStore()

  const salesDataRef = useRef<SalesFormData>({} as SalesFormData)
  const [color, setColor] = useState(activeSale?.color || DEFAULT_SALE_COLOR)
  const takenColors = currentPageSales
    .filter((sale) => sale.id !== activeSale?.id)
    .map((sale) => sale.color)
    .filter((value): value is string => !!value)
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

    const response = await editSale(activeSale.id, {
      ...salesDataRef.current,
      color,
      startsAt: datetimeLocalToIso(salesDataRef.current.startsAt),
      endsAt: datetimeLocalToIso(salesDataRef.current.endsAt),
    })

    if (response) {
      toast(tx("Sale is updated"), {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }

    await fetchSalesData()
    setLoading(false)
    changeIsSaleEditModalOpen(false)
  }

  // Enter in a one-line field saves, like the button
  const onEnter = useEnterSave(onSave, loading)

  const onRemove = async () => {
    if (!activeSale?.id) return

    setLoading(true)
    const response = await removeSale(activeSale.id)

    if (response) {
      toast(tx("Sale is removed"), {
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
        refreshSaleTags()

        toast(tx("Product removed from sale"), {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
        })
      } else {
        toast(tx("Failed to remove product from sale"), {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
        })
      }
    } catch (error) {
      toast(tx("Failed to remove product from sale"), {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // a price changed in the list stays changed when the modal is opened again
  const changeProductPrice = (productOnSaleId: string, price: string) => {
    if (!activeSale) return
    const productOnSale = activeSale.productOnSale.map((row) =>
      row.id === productOnSaleId ? { ...row, discountedPrice: price } : row
    )
    changeActiveSale({ ...activeSale, productOnSale })
    useSalesSliceStore.setState((state) => ({
      currentPageSales: state.currentPageSales.map((sale) =>
        sale.id === activeSale.id ? { ...sale, productOnSale } : sale
      ),
    }))
  }

  useEffect(() => {
    setColor(activeSale?.color || DEFAULT_SALE_COLOR)
  }, [activeSale?.id, activeSale?.color])

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
    <Modal root={modalRoot()}
      dismissible
      show={isSaleEditModalOpen}
      onClose={closeModal}
      size="4xl"
      className="max-h-[95vh] overflow-hidden"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
          <span className="font-semibold text-gray-900 dark:text-white text-lg">
            {tx("Edit Sale")}
          </span>
          {activeSale?.name && (
            <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {activeSale.name}
              {activeSale.startsAt && activeSale.endsAt && (
                <span className="text-xs">· {saleTiming(activeSale.startsAt, activeSale.endsAt).text}</span>
              )}
            </span>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6 sm:space-y-8 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
        <form ref={formRef} className="space-y-6 sm:space-y-8" onKeyDown={onEnter}>
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
              {tx("Sale Information")}
            </h3>
            <div>
              <Label
                htmlFor="name"
                value={tx("Sale Name")}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
              />
              <TextInput
                name="name"
                onChange={handleInputChange}
                id="name"
                required
                type="text"
                defaultValue={activeSale?.name ? activeSale.name : ''}
                placeholder={tx("Enter sale name...")}
                className="w-full"
              />
            </div>
            <div className="mt-4">
              <SaleColorPicker value={color} onChange={setColor} taken={takenColors} />
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
              {tx("Sale Period")}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* START DATE */}
              <div>
                <Label
                  htmlFor="startsAt"
                  value={tx("Start Date & Time")}
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
                  value={tx("End Date & Time")}
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

          <SaleProductSearch />

          {/* Products on Sale */}
          {activeSale && activeSale?.productOnSale?.length > 0 && (
            <SaleProductsList
              rows={activeSale.productOnSale}
              onPriceSaved={changeProductPrice}
              onRemove={handleRemoveProduct}
            />
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
            {tx("Update Sale")}
          </Button>
          <Button
            isProcessing={loading}
            color="red"
            onClick={onRemove}
            className="flex-1 sm:w-auto order-2 h-10 touch-manipulation"
            size="sm"
          >
            {tx("Remove Sale")}
          </Button>
          <Button
            disabled={loading}
            color="gray"
            onClick={closeModal}
            className="hidden sm:block sm:w-auto order-3 h-10 touch-manipulation"
            size="sm"
          >
            {tx("Cancel")}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default EditSaleModal

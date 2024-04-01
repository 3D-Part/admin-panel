'use client'

import React, { useEffect, useRef, useState } from 'react'
import { PaginationData, PromoCode, Sale } from '@/shared/types'
import { useSalesSliceStore } from '@/store/store'
import { SalesTable } from './components/SalesTable/SalesTable'
import { WarningModal } from '@/components/common'
import { toast } from 'react-toastify'
import { SalesHeader } from './components/SalesHeader/SalesHeader'
import AddNewSaleModal from './components/Modals/AddNewSaleModal/AddNewSaleModal'
import EditSaleModal from './components/Modals/EditSaleModal/EditSaleModal'
import { SalesAPI } from '@/services'

export const Sales = () => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)
  const activeSaleRef = useRef<Sale>()

  // const { currentPage, totalPages, changeCurrentPage } =
  //   useSubscribersSliceStore()

  const {
    fetchSales,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
  } = useSalesSliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  const fetchSalesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchSales(paginationData)
  }

  const onWarningModalOpen = (sale: Sale) => {
    setIsWarningModalOpen(true)
    activeSaleRef.current = sale
  }

  const onWarningModalConfirm = async () => {
    if (!activeSaleRef.current) {
      setIsWarningModalOpen(false)
      return
    }

    const response = await SalesAPI.removeSale(activeSaleRef.current?.id)

    if (response) {
      const toastMessage = `sale ${activeSaleRef.current.name} is removed`
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      fetchSalesData()
    }
    setIsWarningModalOpen(false)
  }

  const onWarningModalClose = () => {
    setIsWarningModalOpen(false)
  }

  return (
    <div className="w-full">
      <SalesHeader />
      <SalesTable onWarningModalOpen={onWarningModalOpen} />

      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={`Are you sure you want to delete ${activeSaleRef.current?.name}?`}
      />

      <AddNewSaleModal />
      <EditSaleModal />
    </div>
  )
}

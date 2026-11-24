'use client'
import { refreshSaleTags } from '@/shared/helpers/saleTags'
import { tx } from '@/shared/i18n'

import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUISliceStore } from '@/store/store'
import { PaginationData, PromoCode, Sale } from '@/shared/types'
import { useSalesSliceStore, useCurrentUserStore } from '@/store/store'
import { SalesTable } from './components/SalesTable/SalesTable'
import { WarningModal } from '@/components/common'
import { toast } from 'react-toastify'
import { SalesHeader } from './components/SalesHeader/SalesHeader'
import AddNewSaleModal from './components/Modals/AddNewSaleModal/AddNewSaleModal'
import EditSaleModal from './components/Modals/EditSaleModal/EditSaleModal'
import { SalesAPI } from '@/services'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

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

  const { currentUser } = useCurrentUserStore()

  // /sales?sale=<id> (a sale pill elsewhere in the admin) opens that sale
  const saleFromLink = useSearchParams().get('sale')
  const { changeActiveSale } = useSalesSliceStore()
  const { changeIsSaleEditModalOpen } = useUISliceStore()
  useEffect(() => {
    if (!saleFromLink) return
    SalesAPI.getSales({ order: 'DESC', field: 'createdAt' } as any, { offset: 0, limit: 1 }, {
      filters: { id: { is: saleFromLink } },
    }).then((data) => {
      const sale = data?.rows?.[0]
      if (!sale) return
      changeActiveSale(sale)
      changeIsSaleEditModalOpen(true)
    })
  }, [saleFromLink, changeActiveSale, changeIsSaleEditModalOpen])

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.SALE_WRITE,
    currentUser?.role
  )

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
    if (!hasWritePermission) {
      return
    }
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
      refreshSaleTags()
      const toastMessage = tx("sale {name} is removed", { name: activeSaleRef.current.name })
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
    <div className="w-full flex flex-col h-full">
      <SalesHeader />
      <SalesTable onWarningModalOpen={onWarningModalOpen} />

      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={tx("Are you sure you want to delete {name}?", { name: activeSaleRef.current?.name })}
      />

      <AddNewSaleModal />
      <EditSaleModal />
    </div>
  )
}

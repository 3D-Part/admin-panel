'use client'

import React, { useEffect, useRef, useState } from 'react'
import { PaginationData, PromoCode } from '@/shared/types'
import {
  usePromoCodesSliceStore,
  useSubscribersSliceStore,
  useCurrentUserStore,
} from '@/store/store'
import { PromoCodesTable } from './components/PromoCodesTable/PromoCodesTable'
import { PromoCodesHeader } from './components/PromoCodesHeader/PromoCodesHeader'
import { WarningModal } from '@/components/common'
import PromoCodesAPI from '@/services/promoCodes'
import { toast } from 'react-toastify'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const PromoCodes = () => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)
  const activePromoCodeRef = useRef<PromoCode>()

  // const { currentPage, totalPages, changeCurrentPage } =
  //   useSubscribersSliceStore()

  const {
    fetchPromoCodes,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
  } = usePromoCodesSliceStore()

  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.PROMO_CODE_WRITE,
    currentUser?.role
  )

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  const fetchPromoCodesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchPromoCodes(paginationData)
  }

  const onWarningModalOpen = (promoCode: PromoCode) => {
    if (!hasWritePermission) {
      return
    }
    setIsWarningModalOpen(true)
    activePromoCodeRef.current = promoCode
  }

  const onWarningModalConfirm = async () => {
    if (!activePromoCodeRef.current) {
      setIsWarningModalOpen(false)
      return
    }

    const response = await PromoCodesAPI.removePromoCode(
      activePromoCodeRef.current?.id
    )

    if (response) {
      const toastMessage = `promo code ${activePromoCodeRef.current.code} is removed`
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      fetchPromoCodesData()
    }
    setIsWarningModalOpen(false)
  }

  const onWarningModalClose = () => {
    setIsWarningModalOpen(false)
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <PromoCodesHeader />
      <PromoCodesTable onWarningModalOpen={onWarningModalOpen} />

      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={`Are you sure you want to delete ${activePromoCodeRef.current?.code}?`}
      />
    </div>
  )
}

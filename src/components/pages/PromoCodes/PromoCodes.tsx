'use client'

import React, { useEffect } from 'react'
import { PaginationData } from '@/shared/types'
import { useSubscribersSliceStore } from '@/store/store'
import { PromoCodesTable } from './components/PromoCodesTable/PromoCodesTable'
import { PromoCodesHeader } from './components/PromoCodesHeader/PromoCodesHeader'

export const PromoCodes = () => {
  const { currentPage, totalPages, changeCurrentPage } =
    useSubscribersSliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="w-full">
      <PromoCodesHeader />
      <PromoCodesTable />
    </div>
  )
}

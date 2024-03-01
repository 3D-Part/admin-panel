'use client'

import React, { useEffect } from 'react'
import { PaginationData } from '@/shared/types'
import { useSubscribersSliceStore } from '@/store/store'
import { PromoCodesTable } from './components/PromoCodesTable/PromoCodesTable'

export const PromoCodes = () => {
  const {
    fetchSubscribers,
    currentPage,
    itemsPerPage,
    totalPages,
    changeCurrentPage,
  } = useSubscribersSliceStore()

  const fetchSubscriberssData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchSubscribers(paginationData)
  }

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="w-full">
      {/* <MSubscribersHeader /> */}
      <PromoCodesTable />
    </div>
  )
}

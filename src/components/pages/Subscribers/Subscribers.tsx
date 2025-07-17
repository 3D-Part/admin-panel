'use client'

import React, { useEffect } from 'react'
import { PaginationData } from '@/shared/types'
import { SubscribersTable } from './components/SubscribersTable/SubscribersTable'
import { useSubscribersSliceStore } from '@/store/store'
import { SubscribersHeader } from './components/SubscribersHeader/SubscribersHeader'

export const Subscribers = () => {
  const {
    fetchSubscribers,
    currentPage,
    itemsPerPage,
    totalPages,
    changeCurrentPage,
  } = useSubscribersSliceStore()

  // const fetchSubscriberssData = async () => {
  //   const paginationData: PaginationData = {
  //     offset: (currentPage - 1) * itemsPerPage,
  //     limit: itemsPerPage,
  //   }
  //   await fetchSubscribers(paginationData)
  // }

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="w-full">
      <SubscribersHeader />
      <SubscribersTable />
    </div>
  )
}

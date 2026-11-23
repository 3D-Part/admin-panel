'use client'

import React, { useEffect, useState } from 'react'
import { PaginationData } from '@/shared/types'
import { SubscribersTable } from './components/SubscribersTable/SubscribersTable'
import { useSubscribersSliceStore } from '@/store/store'
import { SubscribersHeader } from './components/SubscribersHeader/SubscribersHeader'
import ZohoSummary from './components/ZohoSummary/ZohoSummary'

export const Subscribers = () => {
  const {
    fetchSubscribers,
    currentPage,
    itemsPerPage,
    totalPages,
    changeCurrentPage,
    count,
  } = useSubscribersSliceStore()

  // e-mails ticked in the table, kept across pages
  const [selected, setSelected] = useState<string[]>([])

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
    <div className="w-full flex flex-col h-full">
      <ZohoSummary />
      <SubscribersHeader selected={selected} total={count} />
      <SubscribersTable selected={selected} setSelected={setSelected} />
    </div>
  )
}

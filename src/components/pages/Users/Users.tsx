'use client'

import React, { useEffect } from 'react'
import { UsersTable } from './components/UsersTable/UsersTable'
import { useUsersSliceStore } from '@/store/store'

export const Users = () => {
  const { currentPage, totalPages, changeCurrentPage } = useUsersSliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="w-full">
      {/* <MSubscribersHeader /> */}
      <UsersTable />
    </div>
  )
}

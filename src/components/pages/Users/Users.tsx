'use client'

import React, { useEffect } from 'react'
import { UsersTable } from './components/UsersTable/UsersTable'
import { useUsersSliceStore } from '@/store/store'
import { UsersHeader } from '@/components/pages/Users/components/UsersHeader/UsersHeader'

export const Users = () => {
  const { currentPage, totalPages, changeCurrentPage } = useUsersSliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <UsersHeader />
      <UsersTable />
    </div>
  )
}

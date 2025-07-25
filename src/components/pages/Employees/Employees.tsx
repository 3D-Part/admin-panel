'use client'

import React, { useEffect } from 'react'
import { EmployeesTable } from '@/components/pages/Employees/components/EmployeesTable/EmployeesTable'
import { useEmployeesSliceStore } from '@/store/store'

export const Employees = () => {
  const { currentPage, totalPages, changeCurrentPage } =
    useEmployeesSliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="w-full">
      <EmployeesTable />
    </div>
  )
}

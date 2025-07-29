'use client'

import React, { useEffect } from 'react'
import { EmployeesTable } from '@/components/pages/Employees/components/EmployeesTable/EmployeesTable'
import { EmployeesHeader } from '@/components/pages/Employees/components/EmployeesHeader/EmployeesHeader'
import CreateEmployeeModal from '@/components/pages/Employees/components/CreateEmployeeModal/CreateEmployeeModal'
import { useEmployeesSliceStore, useUISliceStore } from '@/store/store'

export const Employees = () => {
  const { currentPage, totalPages, changeCurrentPage } =
    useEmployeesSliceStore()
  const { isEmployeeAddNewModalOpen, changeIsEmployeeAddNewModalOpen } =
    useUISliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  const handleEmployeeCreated = () => {
    // Refresh the employees list or handle success
    // You can add a refresh function here if needed
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <EmployeesHeader />
      <EmployeesTable />

      <CreateEmployeeModal
        isOpen={isEmployeeAddNewModalOpen}
        onClose={() => changeIsEmployeeAddNewModalOpen(false)}
        onSuccess={handleEmployeeCreated}
      />
    </div>
  )
}

'use client'

import React, { useEffect } from 'react'
import { EmployeesTable } from '@/components/pages/Employees/components/EmployeesTable/EmployeesTable'
import { EmployeesHeader } from '@/components/pages/Employees/components/EmployeesHeader/EmployeesHeader'
import CreateEmployeeModal from '@/components/pages/Employees/components/CreateEmployeeModal/CreateEmployeeModal'
import EditEmployeeModal from '@/components/pages/Employees/components/EditEmployeeModal/EditEmployeeModal'
import { useEmployeesSliceStore, useUISliceStore } from '@/store/store'

export const Employees = () => {
  const {
    currentPage,
    totalPages,
    changeCurrentPage,
    selectedEmployee,
    fetchEmployees,
  } = useEmployeesSliceStore()
  const {
    isEmployeeAddNewModalOpen,
    changeIsEmployeeAddNewModalOpen,
    isEmployeeEditModalOpen,
    changeIsEmployeeEditModalOpen,
  } = useUISliceStore()

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  const handleEmployeeCreated = () => {
    // Refresh the employees list or handle success
    // You can add a refresh function here if needed
  }

  const handleEmployeeUpdated = () => {
    // Refresh the employees list after successful update
    fetchEmployees()
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

      <EditEmployeeModal
        isOpen={isEmployeeEditModalOpen}
        onClose={() => changeIsEmployeeEditModalOpen(false)}
        onSuccess={handleEmployeeUpdated}
        employee={selectedEmployee}
      />
    </div>
  )
}

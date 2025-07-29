'use client'

import { User } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'
import { useEmployeesSliceStore, useUISliceStore } from '@/store/store'

type TableItemType = {
  employee: User
}

export const TableItem: React.FC<TableItemType> = ({ employee }) => {
  const { fullName, email } = employee
  const { changeSelectedEmployee } = useEmployeesSliceStore()
  const { changeIsEmployeeEditModalOpen } = useUISliceStore()

  const handleRowClick = () => {
    changeSelectedEmployee(employee)
    changeIsEmployeeEditModalOpen(true)
  }

  return (
    <Table.Row
      className="table-row hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      <Table.Cell className="whitespace-nowrap font-medium table-cell">
        <div className="flex justify-start items-center gap-6">{fullName}</div>
      </Table.Cell>
      <Table.Cell className="whitespace-nowrap font-medium table-cell">
        <div className="flex justify-start items-center gap-6">{email}</div>
      </Table.Cell>
      <Table.Cell className="whitespace-nowrap font-medium table-cell"></Table.Cell>
    </Table.Row>
  )
}

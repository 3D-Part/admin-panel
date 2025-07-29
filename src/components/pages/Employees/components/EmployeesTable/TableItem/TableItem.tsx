'use client'

import { User } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'
import {
  useEmployeesSliceStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type TableItemType = {
  employee: User
}

export const TableItem: React.FC<TableItemType> = ({ employee }) => {
  const { fullName, email } = employee
  const { changeSelectedEmployee } = useEmployeesSliceStore()
  const { changeIsEmployeeEditModalOpen } = useUISliceStore()
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.EMPLOYEE_WRITE,
    currentUser?.role
  )

  const handleRowClick = () => {
    if (!hasWritePermission) {
      return
    }
    changeSelectedEmployee(employee)
    changeIsEmployeeEditModalOpen(true)
  }

  return (
    <Table.Row
      className={`table-row transition-colors ${
        hasWritePermission
          ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
          : ''
      }`}
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

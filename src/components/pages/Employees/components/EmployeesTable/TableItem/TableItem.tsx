'use client'

import { User } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'

type TableItemType = {
  employee: User
}

export const TableItem: React.FC<TableItemType> = ({ employee }) => {
  const { fullName, email } = employee

  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
        <div className="flex justify-start items-center gap-6">{fullName}</div>
      </Table.Cell>
      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
        <div className="flex justify-start items-center gap-6">{email}</div>
      </Table.Cell>
    </Table.Row>
  )
}

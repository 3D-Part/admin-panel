import React from 'react'
import { OrderEmail } from '@/shared/types'
import { Table } from 'flowbite-react'

type TableItemType = {
  email: OrderEmail
}

export const TableItem: React.FC<TableItemType> = ({ email }) => {
  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">{email}</div>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

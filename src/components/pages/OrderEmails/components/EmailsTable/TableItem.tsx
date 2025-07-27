import React from 'react'
import { OrderEmail } from '@/shared/types'
import { Table } from 'flowbite-react'

type TableItemType = {
  email: OrderEmail
}

export const TableItem: React.FC<TableItemType> = ({ email }) => {
  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">{email}</div>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

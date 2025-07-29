import { Subscriber } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'

type TableItemType = {
  subscriber: Subscriber
}

export const TableItem: React.FC<TableItemType> = ({ subscriber }) => {
  const { email } = subscriber

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

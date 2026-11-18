import React from 'react'
import { CustomerFlagFor } from '@/components/common/CustomerFlag/CustomerFlag'
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
          <div className="flex justify-start items-center gap-2">
            {email}
            <CustomerFlagFor email={email} />
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

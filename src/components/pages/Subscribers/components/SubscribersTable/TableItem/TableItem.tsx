import { CustomerFlagFor } from '@/components/common/CustomerFlag/CustomerFlag'
import { Subscriber } from '@/shared/types'
import { Checkbox, Table } from 'flowbite-react'
import React from 'react'

type TableItemType = {
  subscriber: Subscriber
  checked: boolean
  onToggle: () => void
}

export const TableItem: React.FC<TableItemType> = ({ subscriber, checked, onToggle }) => {
  const { email } = subscriber

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell className="w-10">
          <Checkbox checked={checked} onChange={onToggle} aria-label={email} />
        </Table.Cell>
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

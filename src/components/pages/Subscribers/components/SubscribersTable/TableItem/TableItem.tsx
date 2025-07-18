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
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">{email}</div>
        </Table.Cell>
        {/* <Table.Cell>
                    <div className="flex justify-end items-center gap-8">
                        <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
                            <p>Edit</p>
                        </span>
                        <span className="font-medium text-red-500 cursor-pointer hover:underline dark:text-red-500">
                            <p>Remove</p>
                        </span>
                    </div>
                </Table.Cell> */}
      </Table.Row>
    </>
  )
}

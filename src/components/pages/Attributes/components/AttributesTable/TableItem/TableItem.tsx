import { AttributeData } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'

type TableItemType = {
  attribute: AttributeData
  onWarningModalOpen: (attribute: AttributeData) => void
  openEditModal: (attribute: AttributeData) => void
}

export const TableItem: React.FC<TableItemType> = ({
  attribute,
  onWarningModalOpen,
  openEditModal,
}) => {
  const { name } = attribute

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell
          onClick={() => openEditModal(attribute)}
          className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white"
        >
          <div className="flex justify-start items-center gap-6">{name}</div>
        </Table.Cell>
        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={() => openEditModal(attribute)}
              className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500"
            >
              <p>Edit</p>
            </span>
            <span
              onClick={() => onWarningModalOpen(attribute)}
              className="font-medium text-red-500 cursor-pointer hover:underline dark:text-red-500"
            >
              <p>Remove</p>
            </span>
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

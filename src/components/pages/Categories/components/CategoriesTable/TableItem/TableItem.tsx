import { CategoryData } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'

type TableItemType = {
  category: CategoryData
  onWarningModalOpen: (category: CategoryData) => void
  openEditModal: (category: CategoryData) => void
}

export const TableItem: React.FC<TableItemType> = ({
  category,
  onWarningModalOpen,
  openEditModal,
}) => {
  const { name, slug, category: parentCategory } = category

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell
          onClick={() => openEditModal(category)}
          className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white"
        >
          <div className="flex justify-start items-center gap-6">{name}</div>
        </Table.Cell>
        <Table.Cell>{parentCategory ? parentCategory.name : ''}</Table.Cell>
        <Table.Cell>{slug}</Table.Cell>
        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={() => openEditModal(category)}
              className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500"
            >
              <p>Edit</p>
            </span>
            <span
              onClick={() => onWarningModalOpen(category)}
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

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
      <Table.Row className="table-row">
        <Table.Cell
          onClick={() => openEditModal(category)}
          className="cursor-pointer whitespace-nowrap font-medium table-cell"
        >
          <div className="flex justify-start items-center gap-6">{name}</div>
        </Table.Cell>
        <Table.Cell>{parentCategory ? parentCategory.name : ''}</Table.Cell>
        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={() => openEditModal(category)}
              className="font-medium table-action-link cursor-pointer hover:underline"
            >
              <p>Edit</p>
            </span>
            <span
              onClick={() => onWarningModalOpen(category)}
              className="font-medium table-action-danger cursor-pointer hover:underline"
            >
              <p>Remove</p>
            </span>
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

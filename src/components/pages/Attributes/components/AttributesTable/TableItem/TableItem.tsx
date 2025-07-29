import { AttributeData } from '@/shared/types'
import { Table } from 'flowbite-react'
import React from 'react'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

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
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.ATTRIBUTES_WRITE,
    currentUser?.role
  )

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          onClick={
            hasWritePermission ? () => openEditModal(attribute) : undefined
          }
          className={`whitespace-nowrap font-medium table-cell ${
            hasWritePermission ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex justify-start items-center gap-6">{name}</div>
        </Table.Cell>
        <Table.Cell>
          {hasWritePermission && (
            <div className="flex justify-end items-center gap-8">
              <span
                onClick={() => openEditModal(attribute)}
                className="font-medium table-action-link cursor-pointer hover:underline"
              >
                <p>Edit</p>
              </span>
              <span
                onClick={() => onWarningModalOpen(attribute)}
                className="font-medium table-action-danger cursor-pointer hover:underline"
              >
                <p>Remove</p>
              </span>
            </div>
          )}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

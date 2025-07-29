'use client'

import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { Sale } from '@/shared/types'
import {
  useSalesSliceStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import { Table } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type TableItemType = {
  sale: Sale
  onWarningModalOpen: (sale: Sale) => void
}

export const TableItem: React.FC<TableItemType> = ({
  sale,
  onWarningModalOpen,
}) => {
  const { changeIsSaleEditModalOpen } = useUISliceStore()

  const { startsAt, endsAt, name, id } = sale

  const startTime = dateTimeFormat(startsAt, true)
  const endTime = dateTimeFormat(endsAt, true)

  const router = useRouter()

  const { changeActiveSale } = useSalesSliceStore()
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.SALE_WRITE,
    currentUser?.role
  )

  const editSale = () => {
    if (!hasWritePermission) {
      return
    }
    changeActiveSale(sale)
    changeIsSaleEditModalOpen(true)
  }

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          onClick={hasWritePermission ? editSale : undefined}
          className={`whitespace-nowrap font-medium table-cell ${
            hasWritePermission ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex justify-start items-center gap-6">{name}</div>
        </Table.Cell>

        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">
            {startTime}
          </div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">{endTime}</div>
        </Table.Cell>
        {/* <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">
            {discountPercentage}
          </div>
        </Table.Cell> */}
        <Table.Cell>
          {hasWritePermission && (
            <div className="flex justify-end items-center gap-8">
              <span
                onClick={editSale}
                className="font-medium table-action-link cursor-pointer hover:underline"
              >
                <p>Edit</p>
              </span>
              <span
                onClick={() => onWarningModalOpen(sale)}
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

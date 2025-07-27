'use client'

import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { Sale } from '@/shared/types'
import { useSalesSliceStore, useUISliceStore } from '@/store/store'
import { Table } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React from 'react'

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

  const editSale = () => {
    changeActiveSale(sale)
    changeIsSaleEditModalOpen(true)
  }

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          onClick={editSale}
          className="cursor-pointer whitespace-nowrap font-medium table-cell"
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
        </Table.Cell>
      </Table.Row>
    </>
  )
}

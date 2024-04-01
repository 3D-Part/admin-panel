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
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell
          onClick={editSale}
          className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white"
        >
          <div className="flex justify-start items-center gap-6">{name}</div>
        </Table.Cell>

        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">
            {startTime}
          </div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">{endTime}</div>
        </Table.Cell>
        {/* <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">
            {discountPercentage}
          </div>
        </Table.Cell> */}
        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={editSale}
              className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500"
            >
              <p>Edit</p>
            </span>
            <span
              onClick={() => onWarningModalOpen(sale)}
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

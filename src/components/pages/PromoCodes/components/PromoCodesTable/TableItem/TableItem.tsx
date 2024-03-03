'use client'
import { URLPartsEnum } from '@/shared/enums'
import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { PromoCode } from '@/shared/types'
import { usePromoCodesSliceStore } from '@/store/store'
import { Table } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React from 'react'

type TableItemType = {
  promocode: PromoCode
}

export const TableItem: React.FC<TableItemType> = ({ promocode }) => {
  const { startsAt, endsAt, code, discountPercentage, id } = promocode

  const startTime = dateTimeFormat(startsAt, true)
  const endTime = dateTimeFormat(endsAt, true)

  const router = useRouter()

  const { changeActivePromoCode } = usePromoCodesSliceStore()

  const editPromoCode = () => {
    changeActivePromoCode(promocode)
    router.push(URLPartsEnum.EditPromoCode)
  }

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">{code}</div>
        </Table.Cell>

        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">
            {startTime}
          </div>
        </Table.Cell>
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">{endTime}</div>
        </Table.Cell>
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">
            {discountPercentage}
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={editPromoCode}
              className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500"
            >
              <p>Edit</p>
            </span>
            <span className="font-medium text-red-500 cursor-pointer hover:underline dark:text-red-500">
              <p>Remove</p>
            </span>
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

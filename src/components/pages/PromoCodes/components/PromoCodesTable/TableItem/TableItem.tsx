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
  onWarningModalOpen: (promocode: PromoCode) => void
}

export const TableItem: React.FC<TableItemType> = ({
  promocode,
  onWarningModalOpen,
}) => {
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
      <Table.Row className="table-row">
        <Table.Cell
          onClick={editPromoCode}
          className="cursor-pointer whitespace-nowrap font-medium table-cell"
        >
          <div className="flex justify-start items-center gap-6">{code}</div>
        </Table.Cell>

        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">
            {discountPercentage}
          </div>
        </Table.Cell>

        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">
            {startTime}
          </div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">{endTime}</div>
        </Table.Cell>

        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={editPromoCode}
              className="font-medium table-action-link cursor-pointer hover:underline"
            >
              <p>Edit</p>
            </span>
            <span
              onClick={() => onWarningModalOpen(promocode)}
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

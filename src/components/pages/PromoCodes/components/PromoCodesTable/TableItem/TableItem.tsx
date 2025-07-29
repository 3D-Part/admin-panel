'use client'
import { URLPartsEnum } from '@/shared/enums'
import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { PromoCode } from '@/shared/types'
import { usePromoCodesSliceStore, useCurrentUserStore } from '@/store/store'
import { Table } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

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
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.PROMO_CODE_WRITE,
    currentUser?.role
  )

  const editPromoCode = () => {
    if (!hasWritePermission) {
      return
    }
    changeActivePromoCode(promocode)
    router.push(URLPartsEnum.EditPromoCode)
  }

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          onClick={hasWritePermission ? editPromoCode : undefined}
          className={`whitespace-nowrap font-medium table-cell ${
            hasWritePermission ? 'cursor-pointer' : ''
          }`}
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
          {hasWritePermission && (
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
          )}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

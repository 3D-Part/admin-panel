import { Order } from '@/shared/types'
import { Badge, Table } from 'flowbite-react'
import React, { useState } from 'react'
import OrderStatus from '../../OrderStatus/OrderStatus'
import { BiMessageDetail, BiNote } from 'react-icons/bi'
import OrderContactForm from '../../OrderContactForm'
import OrderEditModal from '../../OrderEditModal/OrderEditModal'
import OrderDetails from '../../OrderDetails'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type TableItemType = {
  order: Order
}

export const TableItem: React.FC<TableItemType> = ({ order }) => {
  const {
    fullName,
    email,
    city,
    price,
    status,
    createdAt,
    id,
    companyName,
    internalNote,
    hasBackorder,
  } = order

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)

  const { currentUser } = useCurrentUserStore()

  const hasReadPermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.ORDERS_READ,
    currentUser?.role
  )

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.ORDERS_WRITE,
    currentUser?.role
  )

  const isoDate = createdAt
  const date = new Date(isoDate)
  const year = date.toLocaleString('en-US', { year: 'numeric' })
  const month = date.toLocaleString('en-US', { month: '2-digit' })
  const day = date.toLocaleString('en-US', { day: '2-digit' })
  const formattedDate = `${day}.${month}.${year}`

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          className={hasReadPermission ? 'cursor-pointer' : ''}
          onClick={
            hasReadPermission ? () => setIsOrderDetailsOpen(true) : undefined
          }
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              {companyName && (
                <span className="font-bold text-gray-900 dark:text-white">
                  {companyName}
                </span>
              )}
              <span>{fullName}</span>
            </div>
            {internalNote && (
              <span
                title={internalNote}
                className="text-lg text-amber-500 shrink-0"
              >
                <BiNote />
              </span>
            )}
            {hasBackorder && (
              <Badge
                color="warning"
                title="Some products were ordered above the stock level and have to be procured"
                className="shrink-0"
              >
                Backorder
              </Badge>
            )}
          </div>
        </Table.Cell>
        <Table.Cell>{city}</Table.Cell>
        <Table.Cell>{formattedDate}</Table.Cell>
        <Table.Cell>{price}KM</Table.Cell>
        <Table.Cell
          onClick={
            hasWritePermission
              ? () => setIsOrderStatusModalOpen(true)
              : undefined
          }
          className={hasWritePermission ? 'cursor-pointer' : ''}
        >
          <OrderStatus status={status} />
        </Table.Cell>
        <Table.Cell
          onClick={
            hasWritePermission ? () => setIsFormModalOpen(true) : undefined
          }
        >
          <div
            className={`text-xl ${hasWritePermission ? 'cursor-pointer' : ''}`}
          >
            <BiMessageDetail />
          </div>
        </Table.Cell>
      </Table.Row>

      <OrderContactForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialValue={order}
        setIsModalOpen={setIsFormModalOpen}
      />

      {isOrderDetailsOpen && (
        <OrderDetails
          isOpen={isOrderDetailsOpen}
          onClose={() => setIsOrderDetailsOpen(false)}
          order={order}
        />
      )}

      {isOrderStatusModalOpen && (
        <OrderEditModal
          isOpen={isOrderStatusModalOpen}
          onClose={() => setIsOrderStatusModalOpen(false)}
          initialValue={order}
          setIsModalOpen={setIsOrderStatusModalOpen}
        />
      )}
    </>
  )
}

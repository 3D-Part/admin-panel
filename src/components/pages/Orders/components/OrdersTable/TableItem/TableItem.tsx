import { Order } from '@/shared/types'
import { Table } from 'flowbite-react'
import React, { useState } from 'react'
import OrderStatus from '../../OrderStatus/OrderStatus'
import { BiMessageDetail } from 'react-icons/bi'
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
  const { fullName, email, city, price, status, createdAt, id } = order

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
          {fullName}
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

import { Order } from '@/shared/types'
import { Table } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import OrderStatus from '../../OrderStatus/OrderStatus'
import { BiMessageDetail } from 'react-icons/bi'
import OrderContactForm from '../../OrderContactForm'
import OrderEditModal from '../../OrderEditModal/OrderEditModal'
import OrderDetails from '../../OrderDetails'

type TableItemType = {
  order: Order
}

export const TableItem: React.FC<TableItemType> = ({ order }) => {
  const { fullName, email, city, price, status, createdAt } = order

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)

  const isoDate = createdAt
  const date = new Date(isoDate)
  const year = date.toLocaleString('en-US', { year: 'numeric' })
  const month = date.toLocaleString('en-US', { month: '2-digit' })
  const day = date.toLocaleString('en-US', { day: '2-digit' })
  const formattedDate = `${day}.${month}.${year}`

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell
          className="cursor-pointer"
          onClick={() => setIsOrderDetailsOpen(true)}
        >
          {fullName}
        </Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>{city}</Table.Cell>
        <Table.Cell>{formattedDate}</Table.Cell>
        <Table.Cell>{price}KM</Table.Cell>
        <Table.Cell
          onClick={() => setIsOrderStatusModalOpen(true)}
          className="cursor-pointer"
        >
          <OrderStatus status={status} />
        </Table.Cell>
        <Table.Cell onClick={() => setIsFormModalOpen(true)}>
          <div className="text-xl cursor-pointer">
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

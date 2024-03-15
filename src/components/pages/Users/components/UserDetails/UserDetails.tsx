'use client'

import OrderDetails from '@/components/pages/Orders/components/OrderDetails'
import { User, Order } from '@/shared/types'
import { Button, Modal, Table } from 'flowbite-react'
import React, { useState } from 'react'

type UserDetailType = {
  name: string
  value: string | null
  className?: string
  vertical?: boolean
}

const OrderDetail: React.FC<UserDetailType> = ({
  value,
  name,
  vertical,
  className = '',
}) => {
  return (
    <div
      className={`className flex justify-between  gap-4 flex-1 basis-[48%] rounded-lg bg-slate-600 text-white p-3 ${
        vertical ? 'flex-col items-start' : 'items-center'
      }`}
    >
      <p className="font-semibold">{name}</p>
      <span className="text-gray-300">{value ? value : '-'}</span>
    </div>
  )
}

type OrderWrapperType = {
  order: Order
  onClick: (activeOrder: Order) => void
}
const OrderWrapper: React.FC<OrderWrapperType> = ({ order, onClick }) => {
  const { orderNumber, price, products, status, total } = order

  return (
    <Table.Row
      onClick={() => onClick(order)}
      className="bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <Table.Cell className="cursor-pointer">{orderNumber}</Table.Cell>
      <Table.Cell>{price}</Table.Cell>
      <Table.Cell>{products.length}</Table.Cell>
      <Table.Cell>{status}</Table.Cell>
      <Table.Cell>{total}KM</Table.Cell>
    </Table.Row>
  )
}

type UserDetailsType = {
  user: User
  isOpen: boolean
  onClose: () => void
}

const UserDetails: React.FC<UserDetailsType> = ({ user, isOpen, onClose }) => {
  const [isOrderDetailsVisible, setIsOrderDetailsVisible] = useState(false)
  const [activeOrder, setActiveOrder] = useState<Order>({} as Order)

  const {
    id,
    fullName,
    email,
    password,
    role,
    provider,
    phone,
    state,
    city,
    postCode,
    street,
    orders,
  } = user

  const selectActiveOrder = (activeOrder: Order) => {
    setActiveOrder(activeOrder)
    setIsOrderDetailsVisible(true)
  }

  return (
    <>
      <Modal
        className={`${isOrderDetailsVisible ? 'hiddne' : ''}`}
        dismissible
        show={isOpen}
        onClose={onClose}
        size="4xl"
      >
        <Modal.Header>
          User ID: <span className="text-gray-400">#{id}</span>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-wrap gap-4">
            <OrderDetail
              className="cursor-pointer"
              name="Full name:"
              value={fullName}
            />
            <OrderDetail name="Email:" value={email} />
            {/* <OrderDetail name="Password:" value={password} /> */}
            <OrderDetail name="Phone:" value={phone} />
            <OrderDetail name="State:" value={state} />
            <OrderDetail name="City:" value={city} />
            <OrderDetail name="Street:" value={street} />
            <OrderDetail name="PostCode:" value={postCode} />
            <OrderDetail name="Role:" value={role} />
            <OrderDetail name="Provider:" value={provider} />

            {/* <OrderDetail
            name="Description:"
            vertical={true}
            value={description}
          /> */}
          </div>

          {orders.length > 0 && (
            <div className="mt-8 text-white">
              <h3 className="font-semibold text-xl mb-4">Products:</h3>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Order Number</Table.HeadCell>
                  <Table.HeadCell>Price</Table.HeadCell>
                  <Table.HeadCell>Products number</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Total</Table.HeadCell>
                </Table.Head>

                <Table.Body className="divide-y">
                  {orders.map((order) => {
                    return (
                      <OrderWrapper
                        onClick={selectActiveOrder}
                        key={order.id}
                        order={order}
                      />
                    )
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {isOrderDetailsVisible && (
        <OrderDetails
          isOpen={isOrderDetailsVisible}
          onClose={() => setIsOrderDetailsVisible(false)}
          order={activeOrder}
        />
      )}
    </>
  )
}

export default UserDetails

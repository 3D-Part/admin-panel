import { Order, OrderProduct } from '@/shared/types'
import { Button, Modal, Table } from 'flowbite-react'
import React from 'react'

type OrderDetailsType = {
  isOpen: boolean
  order: Order
  onClose: () => void
}

type OrderDetailType = {
  name: string
  value: string
  vertical?: boolean
}
const OrderDetail: React.FC<OrderDetailType> = ({ value, name, vertical }) => {
  return (
    <div
      className={`flex justify-between  gap-4 flex-1 basis-[48%] rounded-lg bg-slate-600 text-white p-3 ${
        vertical ? 'flex-col items-start' : 'items-center'
      }`}
    >
      <p className="font-semibold">{name}</p>
      <span className="text-gray-300">{value}</span>
    </div>
  )
}

type ProductWrapperType = {
  product: OrderProduct
}
const ProductWrapper: React.FC<ProductWrapperType> = ({ product }) => {
  const { name, price, quantity, sku, total } = product

  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table.Cell>{name}</Table.Cell>
      <Table.Cell>{price}</Table.Cell>
      <Table.Cell>{quantity}</Table.Cell>
      <Table.Cell>{sku}</Table.Cell>
      <Table.Cell>{total}KM</Table.Cell>
    </Table.Row>
  )
}

const OrderDetails: React.FC<OrderDetailsType> = ({
  isOpen,
  order,
  onClose,
}) => {
  const {
    createdAt,
    city,
    street,
    fullName,
    status,
    email,
    price,
    total,
    orderNumber,
    phone,
    description,
    postCode,
    shippingPrice,
    discount,
    products,
  } = order

  const isoDate = createdAt
  const date = new Date(isoDate)
  const year = date.toLocaleString('en-US', { year: 'numeric' })
  const month = date.toLocaleString('en-US', { month: '2-digit' })
  const day = date.toLocaleString('en-US', { day: '2-digit' })
  const formattedDate = `${day}.${month}.${year}`

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header>
        Order number <span className="text-gray-400">#{orderNumber}</span>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-wrap gap-4">
          <OrderDetail name="Full name:" value={fullName} />
          <OrderDetail name="Email:" value={email} />
          <OrderDetail name="Date:" value={formattedDate} />
          <OrderDetail name="Status:" value={status} />
          <OrderDetail name="Price:" value={price} />
          <OrderDetail name="Total:" value={total} />
          <OrderDetail name="Shipping price:" value={shippingPrice} />
          <OrderDetail name="Discount:" value={discount} />
          <OrderDetail name="City:" value={city} />
          <OrderDetail name="Street:" value={street} />
          <OrderDetail name="PostCode:" value={postCode} />
          <OrderDetail name="Phone:" value={phone} />
          <OrderDetail
            name="Description:"
            vertical={true}
            value={description}
          />
        </div>

        <div className="mt-8 text-white">
          <h3 className="font-semibold text-xl mb-4">Products:</h3>
          <Table>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Sku</Table.HeadCell>
              <Table.HeadCell>Total</Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y">
              {products.map((product) => {
                return <ProductWrapper key={product.id} product={product} />
              })}
            </Table.Body>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderDetails

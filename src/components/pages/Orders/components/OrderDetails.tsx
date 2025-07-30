import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { Order, OrderProduct } from '@/shared/types'
import { Button, Modal, Badge } from 'flowbite-react'
import React from 'react'

type OrderDetailsType = {
  isOpen: boolean
  order: Order
  onClose: () => void
}

type OrderDetailType = {
  name: string
  value: string
  className?: string
}

const OrderDetail: React.FC<OrderDetailType> = ({
  value,
  name,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}
    >
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {name}
      </p>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value || '—'}
      </span>
    </div>
  )
}

type ProductCardType = {
  product: OrderProduct
}

const ProductCard: React.FC<ProductCardType> = ({ product }) => {
  const { name, price, quantity, sku, total } = product

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          {name}
        </h4>
        <Badge color="gray" className="text-xs">
          {sku}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Price</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {price} KM
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Qty</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {quantity}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Total</p>
          <p className="font-medium text-green-600 dark:text-green-400">
            {total} KM
          </p>
        </div>
      </div>
    </div>
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
    companyPdv,
    companyName,
    jib,
  } = order

  const formattedDate = dateTimeFormat(createdAt)

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            Order #{orderNumber}
          </span>
          <Badge
            color={
              status === 'pending'
                ? 'yellow'
                : status === 'accepted'
                ? 'green'
                : status === 'declined'
                ? 'red'
                : 'blue'
            }
            className="w-fit"
          >
            {status}
          </Badge>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OrderDetail name="Full Name" value={fullName} />
            <OrderDetail name="Email" value={email} />
            <OrderDetail name="Phone" value={phone} />
            <OrderDetail name="Date" value={formattedDate} />
          </div>
        </div>

        {/* Shipping Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Shipping Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OrderDetail name="City" value={city} />
            <OrderDetail name="Street" value={street} />
            <OrderDetail name="Post Code" value={postCode} />
          </div>
        </div>

        {/* Company Information (if exists) */}
        {(companyName || companyPdv || jib) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyName && (
                <OrderDetail name="Company Name" value={companyName} />
              )}
              {companyPdv && (
                <OrderDetail name="Company PDV" value={companyPdv} />
              )}
              {jib && <OrderDetail name="JIB" value={jib} />}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OrderDetail name="Subtotal" value={`${price} KM`} />
            <OrderDetail name="Shipping" value={`${shippingPrice} KM`} />
            <OrderDetail
              name="Discount"
              value={discount ? `${discount} KM` : '0 KM'}
            />
            <OrderDetail
              name="Total"
              value={`${total} KM`}
              className="sm:col-span-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            />
          </div>
        </div>

        {/* Description */}
        {description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notes
            </h3>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-900 dark:text-white">
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Products ({products.length})
          </h3>
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderDetails

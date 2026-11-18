import { OrderFlagPicker } from '@/components/common/OrderFlag/OrderFlag'
import { tx } from '@/shared/i18n'
import InfoTip from '@/components/common/InfoTip/InfoTip'
import { modalRoot } from '@/shared/helpers/modalRoot'
import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { Order, OrderProduct } from '@/shared/types'
import { Button, Modal, Badge, Label, Textarea, ToggleSwitch } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { BackofficeAPI, OrdersAPI } from '@/services'
import {
  CustomerFlagBadge,
  CustomerProfileForm,
  useCustomerProfiles,
} from '@/components/common/CustomerFlag/CustomerFlag'
import { useCurrentUserStore, useOrdersStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'
import OrderEditor from './OrderEditor/OrderEditor'
import SendOfferButton from './SendOfferButton'

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


/** A note on this order or offer only; the customer's other orders do not show it. */
const OrderNoteForm: React.FC<{
  order: Order
  disabled?: boolean
  onSaved: (note: string) => void
}> = ({ order, disabled, onSaved }) => {
  const [note, setNote] = useState(order.internalNote ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNote(order.internalNote ?? '')
  }, [order.id, order.internalNote])

  const save = async () => {
    setSaving(true)
    const saved = await OrdersAPI.orderUpdateNote(order.id, note.trim())
    setSaving(false)
    if (!saved) {
      toast(tx("Could not save"), { type: 'error', autoClose: 2000 })
      return
    }
    onSaved(note.trim())
    toast(tx("Note saved"), { type: 'success', autoClose: 2000 })
  }

  return (
    <div className="relative w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
      <InfoTip
        text={tx(
          'Only for this order or offer, e.g. what was agreed. Other orders of the customer do not show it. The customer never sees it.'
        )}
      />
      <h4 className="pr-8 text-sm font-semibold text-gray-900 dark:text-white">
        {tx('This order')} <span className="font-normal text-gray-500">(#{order.orderNumber})</span>
      </h4>
      <div>
        <Label htmlFor="order-note" value={tx("Note on this order (staff only)")} />
        <Textarea
          id="order-note"
          rows={2}
          maxLength={2000}
          value={note}
          disabled={disabled}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {!disabled && (
        <Button
          size="sm"
          color="purple"
          disabled={saving || note.trim() === (order.internalNote ?? '')}
          onClick={save}
        >
          {tx("Save note")}
        </Button>
      )}
    </div>
  )
}

const OrderDetail: React.FC<OrderDetailType> = ({
  value,
  name,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-lg border ${
        className ||
        'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
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
  const { name, price, quantity, sku, total, backorderQuantity } = product

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          {name}
        </h4>
        <div className="flex gap-2">
          {!!backorderQuantity && (
            <Badge color="warning" className="text-xs">
              To procure: {backorderQuantity} pcs
            </Badge>
          )}
          <Badge color="gray" className="text-xs">
            {sku}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-gray-500 dark:text-gray-400">{tx("Price")}</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {price} KM
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">{tx("Qty")}</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {quantity}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">{tx("Total")}</p>
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
  const { fetchOrders, currentPage, itemsPerPage } = useOrdersStore()
  const { currentUser } = useCurrentUserStore()
  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.ORDERS_WRITE,
    currentUser?.role
  )
  const [currentOrder, setCurrentOrder] = useState(order)
  const [packing, setPacking] = useState<OrderProduct[] | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setCurrentOrder(order)
  }, [order])

  // the lines in the order they get packed: by manufacturer, then by product
  useEffect(() => {
    if (!isOpen || !currentOrder?.id) return
    let active = true
    setPacking(null)
    BackofficeAPI.getPackingList(currentOrder.id).then((list) => {
      if (active && list) setPacking(list)
    })
    return () => {
      active = false
    }
  }, [isOpen, currentOrder])

  const changeDisputed = async (disputed: boolean) => {
    const updated = await OrdersAPI.orderSetDisputed(currentOrder.id, disputed)
    if (!updated) {
      toast(tx("Could not save"), { type: 'error', autoClose: 2000 })
      return
    }
    setCurrentOrder({ ...currentOrder, disputed })
    fetchOrders({
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    })
  }

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
    points,
    jib,
    user,
    hasBackorder,
  } = currentOrder
  const customerProfiles = useCustomerProfiles([email])

  const formattedDate = dateTimeFormat(createdAt)

  return (
    <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            Order #{orderNumber}
          </span>
          <CustomerFlagBadge profile={customerProfiles[email?.toLowerCase()]} withLabel />
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
        {hasBackorder && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-900 dark:text-amber-100">
            <p className="font-semibold">{tx("Backorder")}</p>
            <p>
              Some products were not in stock when this order was placed. The
              customer was told delivery will take longer. Procure the missing
              pieces (marked below) before shipping.
            </p>
          </div>
        )}
        {/* Customer Information */}
        {user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {tx("Customer Information")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <OrderDetail
                name="Customer ID"
                value={user.id}
                className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
              />
              <OrderDetail
                name="Account Name"
                value={user.fullName}
                className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
              />
              <OrderDetail
                name="Account Email"
                value={user.email}
                className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
              />

              <OrderDetail
                name="Member Since"
                value={dateTimeFormat(user.createdAt)}
                className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
              />
            </div>

            {/* User Address Information */}
            {(user.state || user.city || user.street || user.postCode) && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-blue-800 dark:text-blue-200 mb-3">
                  {tx("Registered Address")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.state && (
                    <OrderDetail
                      name="State"
                      value={user.state}
                      className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
                    />
                  )}
                  {user.city && (
                    <OrderDetail
                      name="City"
                      value={user.city}
                      className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
                    />
                  )}
                  {user.street && (
                    <OrderDetail
                      name="Street"
                      value={user.street}
                      className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
                    />
                  )}
                  {user.postCode && (
                    <OrderDetail
                      name="Post Code"
                      value={user.postCode}
                      className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            {tx("Contact Information")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OrderDetail name="Full Name" value={fullName} />
            <OrderDetail name="Email" value={email} />
            <OrderDetail name="Phone" value={phone} />
            <OrderDetail name="Order Date" value={formattedDate} />
          </div>
        </div>

        {/* Shipping Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {tx("Shipping Address")}
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
              {tx("Company Information")}
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
            {tx("Order Summary")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OrderDetail name="Subtotal" value={`${price} KM`} />
            <OrderDetail name="Shipping" value={`${shippingPrice} KM`} />
            <OrderDetail
              name="Discount"
              value={discount ? `${discount} KM` : '0 KM'}
            />
            <OrderDetail
              name="Used Points"
              value={points ? `${points}` : '0'}
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
              {tx("Notes")}
            </h3>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-900 dark:text-white">
                {description}
              </p>
            </div>
          </div>
        )}

        <ToggleSwitch
          checked={Boolean(currentOrder.disputed)}
          disabled={!hasWritePermission}
          label={tx("Disputed order (only this one, not the customer's other orders)")}
          onChange={changeDisputed}
        />

        <OrderFlagPicker
          order={currentOrder}
          disabled={!hasWritePermission}
          onSaved={(flag) => {
            setCurrentOrder({ ...currentOrder, flag })
            // the list shows the flag on the row
            fetchOrders({
              offset: (currentPage - 1) * itemsPerPage,
              limit: itemsPerPage,
            })
          }}
        />

        <OrderNoteForm
          order={currentOrder}
          disabled={!hasWritePermission}
          onSaved={(internalNote) => {
            setCurrentOrder({ ...currentOrder, internalNote })
            // the list shows a note icon on the row
            fetchOrders({
              offset: (currentPage - 1) * itemsPerPage,
              limit: itemsPerPage,
            })
          }}
        />

        {currentOrder.email && (
          <CustomerProfileForm email={currentOrder.email} inOrder />
        )}

        {/* Products */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Products ({currentOrder.products.length})
          </h3>
          <div className="space-y-3">
            {(packing ?? currentOrder.products).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <Button
          color="purple"
          onClick={() => setIsEditing(true)}
          className="w-full sm:w-auto"
        >
          {tx("Edit order")}
        </Button>
        <SendOfferButton order={currentOrder} onSent={setCurrentOrder} />
        <Button onClick={onClose} className="w-full sm:w-auto">
          {tx("Close")}
        </Button>
      </Modal.Footer>
      {isEditing && (
        <OrderEditor
          order={currentOrder}
          onClose={() => setIsEditing(false)}
          onSaved={(saved) => {
            setCurrentOrder({ ...currentOrder, ...saved })
            setIsEditing(false)
            fetchOrders({ offset: (currentPage - 1) * itemsPerPage, limit: itemsPerPage })
          }}
        />
      )}
    </Modal>
  )
}

export default OrderDetails

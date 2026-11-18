import { tx } from '@/shared/i18n'
import { CustomerFlagBadge } from '@/components/common/CustomerFlag/CustomerFlag'
import { OrderFlagBadge } from '@/components/common/OrderFlag/OrderFlag'
import { CustomerProfile } from '@/services/backoffice'
import { Order } from '@/shared/types'
import { Badge, Table } from 'flowbite-react'
import React, { useState } from 'react'
import OrderSteps from '../../OrderStatus/OrderSteps'
import BillingSteps from '../../OrderStatus/BillingSteps'
import { StepLists } from '@/shared/helpers/billingOptions'
import { BiMessageDetail, BiNote, BiTrash } from 'react-icons/bi'
import { toast } from 'react-toastify'
import { WarningModal } from '@/components/common'
import { OrdersAPI } from '@/services'
import SendOfferButton from '../../SendOfferButton'
import OrderContactForm from '../../OrderContactForm'
import OrderEditModal from '../../OrderEditModal/OrderEditModal'
import OrderDetails from '../../OrderDetails'
import { useCurrentUserStore, useOrdersStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type TableItemType = {
  order: Order
  stepLists: StepLists
  profile?: CustomerProfile
}

export const TableItem: React.FC<TableItemType> = ({
  order,
  stepLists,
  profile,
}) => {
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { fetchOrders } = useOrdersStore()

  // the order goes for good; its stock and the customer's points go back first
  const deleteOrder = async () => {
    setIsDeleteOpen(false)
    if (await OrdersAPI.orderDelete(id)) {
      toast(tx('Order {number} is deleted', { number: order.orderNumber }), { type: 'success', autoClose: 3000 })
      fetchOrders()
    }
  }

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
            <span className="w-4 shrink-0">
              <CustomerFlagBadge profile={profile} />
            </span>
            <div className="flex flex-col">
              {companyName && (
                <span className="font-bold text-gray-900 dark:text-white">
                  {companyName}
                </span>
              )}
              <span>{fullName}</span>
            </div>
            {order.disputed && (
              <Badge color="failure" className="shrink-0">
                {tx("Disputed")}
              </Badge>
            )}
            <OrderFlagBadge flag={order.flag} />
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
                title={tx("Some products were ordered above the stock level and have to be procured")}
                className="shrink-0"
              >
                {tx("Backorder")}
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
          <div className="flex flex-col items-start gap-1.5">
            <OrderSteps order={order} lists={stepLists} />
          </div>
        </Table.Cell>
        <Table.Cell>
          <BillingSteps
            order={order}
            lists={stepLists}
            disabled={!hasWritePermission}
          />
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap">
          <div className="flex items-center gap-2">
            {hasWritePermission && <SendOfferButton order={order} variant="icon" />}
            <button
              type="button"
              disabled={!hasWritePermission}
              onClick={() => setIsFormModalOpen(true)}
              title={tx("Send Message")}
              aria-label={tx("Send Message")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-purple-300"
            >
              <BiMessageDetail className="h-5 w-5" />
            </button>
            {hasWritePermission && (
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                title={tx('Delete order')}
                aria-label={tx('Delete order')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-300"
              >
                <BiTrash className="h-5 w-5" />
              </button>
            )}
          </div>
        </Table.Cell>
      </Table.Row>

      <WarningModal
        isOpen={isDeleteOpen}
        onSave={deleteOrder}
        onClose={() => setIsDeleteOpen(false)}
        message={tx('Delete order {number} for good? Its stock and the customer points go back.', {
          number: order.orderNumber,
        })}
      />

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

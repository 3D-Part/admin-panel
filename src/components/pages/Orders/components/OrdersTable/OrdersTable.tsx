'use client'
import { OrderFlagBadge } from '@/components/common/OrderFlag/OrderFlag'
import { tx } from '@/shared/i18n'
import {
  CustomerFlagBadge,
  useCustomerProfiles,
} from '@/components/common/CustomerFlag/CustomerFlag'

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useOrdersStore, useCurrentUserStore, useShopSettingsStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, Order } from '@/shared/types'
import OrderSteps from '../OrderStatus/OrderSteps'
import BillingSteps from '../OrderStatus/BillingSteps'
import { StepLists, readStepLists } from '@/shared/helpers/billingOptions'
import { BiMessageDetail } from 'react-icons/bi'
import OrderDetails from '../OrderDetails'
import SendOfferButton from '../SendOfferButton'
import OrderContactForm from '../OrderContactForm'
import OrderEditModal from '../OrderEditModal/OrderEditModal'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const OrdersTable = () => {
  const [loader, setLoader] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false)

  const {
    currentPageOrders,
    currentPage,
    itemsPerPage,
    fetchOrders,
    changeCurrentPage,
    totalPages,
    count,
    sortFiled,
    sortOrder,
  } = useOrdersStore()

  const { currentUser } = useCurrentUserStore()
  const { getShopSettings } = useShopSettingsStore()
  // the steps of orders and of offers; each row picks by its status
  const [stepLists, setStepLists] = useState<StepLists>({ orders: [], offers: [] })

  useEffect(() => {
    getShopSettings().then((data) =>
      setStepLists(readStepLists(data?.settings))
    )
  }, [getShopSettings])

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

  const fetchOrdersData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchOrders(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchOrders, itemsPerPage])

  const loaderBg =
    currentPageOrders.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchOrdersData()
  }, [currentPage, fetchOrdersData, sortFiled, sortOrder])

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  const handleOrderClick = (order: Order) => {
    if (!hasReadPermission) {
      return
    }
    setSelectedOrder(order)
    setIsOrderDetailsOpen(true)
  }

  const handleMessageClick = (order: Order) => {
    if (!hasWritePermission) {
      return
    }
    setSelectedOrder(order)
    setIsFormModalOpen(true)
  }

  const handleStatusClick = (order: Order) => {
    if (!hasWritePermission) {
      return
    }
    setSelectedOrder(order)
    setIsOrderStatusModalOpen(true)
  }

  const handleCloseOrderDetails = () => {
    setIsOrderDetailsOpen(false)
    setSelectedOrder(null)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setSelectedOrder(null)
  }

  const handleCloseStatusModal = () => {
    setIsOrderStatusModalOpen(false)
    setSelectedOrder(null)
  }

  // Generate mobile cards
  // the customer's flag shows on every one of their orders
  const profiles = useCustomerProfiles(currentPageOrders.map((o) => o.email))

  const mobileCards = currentPageOrders.map((order) => {
    const { fullName, email, city, price, status, createdAt } = order

    const isoDate = createdAt
    const date = new Date(isoDate)
    const year = date.toLocaleString('en-US', { year: 'numeric' })
    const month = date.toLocaleString('en-US', { month: '2-digit' })
    const day = date.toLocaleString('en-US', { day: '2-digit' })
    const formattedDate = `${day}.${month}.${year}`

    // on phones one compact row per order; the details open on a tap
    return (
      <div
        key={order.id}
        role={hasReadPermission ? 'button' : undefined}
        onClick={hasReadPermission ? () => handleOrderClick(order) : undefined}
        className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0 active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-800"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {order.companyName || fullName}
            </span>
            <CustomerFlagBadge profile={profiles[email?.toLowerCase()]} />
            <OrderFlagBadge flag={order.flag} />
          </div>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {order.orderNumber} · {formattedDate}
            {city ? ` · ${city}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">{price} KM</span>
          <div
            onClick={(e) => {
              e.stopPropagation()
              if (hasWritePermission) handleStatusClick(order)
            }}
            className={hasWritePermission ? 'cursor-pointer' : ''}
          >
            <OrderSteps order={order} lists={stepLists} />
          </div>
        </div>
      </div>
    )
  })

  return (
    <>
      <ResponsiveTableWrapper
        mobileCards={
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          {mobileCards}
        </div>
      }
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => changeCurrentPage(page)}
        count={count}
        className="mt-0"
      >
        <div className="table-container relative">
          <div className="table-body-container ">
            <Table className="w-full [&_th]:!px-3 [&_td]:!px-3">
              <Table.Head className="table-header">
                <Table.HeadCell className="table-cell lg:w-[20%]">{tx("Customer")}</Table.HeadCell>
                <Table.HeadCell className="table-cell lg:w-[9%]">{tx("City")}</Table.HeadCell>
                <Table.HeadCell className="table-cell lg:w-[11%]">{tx("Date")}</Table.HeadCell>
                <Table.HeadCell className="table-cell lg:w-[9%]">{tx("Total")}</Table.HeadCell>
                <Table.HeadCell className="table-cell lg:w-[17%]">{tx("Status")}</Table.HeadCell>
                <Table.HeadCell className="table-cell lg:w-[22%]">{tx("Invoice")}</Table.HeadCell>
                <Table.HeadCell className="table-cell lg:w-[12%]">
                  {tx("Actions")}
                </Table.HeadCell>
              </Table.Head>

              <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentPageOrders.map((order) => {
                  return (
                    <TableItem
                      key={order.id}
                      order={order}
                      stepLists={stepLists}
                      profile={profiles[order.email?.toLowerCase()]}
                    />
                  )
                })}
              </Table.Body>
            </Table>

            {loader && (
              <div
                className={`absolute inset-0 flex items-center justify-center ${loaderBg} rounded-xl`}
              >
                <Loader />
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <Pagination
            currentPage={currentPage}
            onPageChange={(page) => {
              changeCurrentPage(page)
            }}
            totalPages={totalPages}
          />

          <p className="table-total-text text-sm">Total: {count}</p>
        </div>
      </ResponsiveTableWrapper>

      {/* Modals for mobile cards */}
      <OrderContactForm
        isOpen={isFormModalOpen && !!selectedOrder}
        onClose={handleCloseFormModal}
        initialValue={selectedOrder || undefined}
        setIsModalOpen={setIsFormModalOpen}
      />

      {isOrderDetailsOpen && selectedOrder && (
        <OrderDetails
          isOpen={isOrderDetailsOpen}
          onClose={handleCloseOrderDetails}
          order={selectedOrder}
        />
      )}

      {isOrderStatusModalOpen && selectedOrder && (
        <OrderEditModal
          isOpen={isOrderStatusModalOpen}
          onClose={handleCloseStatusModal}
          initialValue={selectedOrder}
          setIsModalOpen={setIsOrderStatusModalOpen}
        />
      )}
    </>
  )
}

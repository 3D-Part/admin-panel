'use client'

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useOrdersStore, useCurrentUserStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, Order } from '@/shared/types'
import OrderStatus from '../OrderStatus/OrderStatus'
import { BiMessageDetail } from 'react-icons/bi'
import OrderDetails from '../OrderDetails'
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
  const mobileCards = currentPageOrders.map((order) => {
    const { fullName, email, city, price, status, createdAt } = order

    const isoDate = createdAt
    const date = new Date(isoDate)
    const year = date.toLocaleString('en-US', { year: 'numeric' })
    const month = date.toLocaleString('en-US', { month: '2-digit' })
    const day = date.toLocaleString('en-US', { day: '2-digit' })
    const formattedDate = `${day}.${month}.${year}`

    return (
      <MobileCardBuilder
        key={order.id}
        title={fullName}
        subtitle={email}
        onClick={hasReadPermission ? () => handleOrderClick(order) : undefined}
        items={[
          {
            label: 'City',
            value: city || (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
          {
            label: 'Date',
            value: formattedDate,
          },
          {
            label: 'Price',
            value: (
              <span className="font-semibold text-green-600 dark:text-green-400">
                {price} KM
              </span>
            ),
          },
          {
            label: 'Status',
            value: (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  if (hasWritePermission) {
                    handleStatusClick(order)
                  }
                }}
                className={
                  hasWritePermission
                    ? 'cursor-pointer hover:opacity-80 transition-opacity'
                    : ''
                }
              >
                <OrderStatus status={status} />
              </div>
            ),
          },
        ]}
        actions={
          hasWritePermission ? (
            <div
              className="flex justify-end items-center gap-3 "
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                onClick={() => handleMessageClick(order)}
              >
                <BiMessageDetail className="text-lg" />
                <span>Send Message</span>
              </button>
            </div>
          ) : null
        }
      />
    )
  })

  return (
    <>
      <ResponsiveTableWrapper
        mobileCards={mobileCards}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => changeCurrentPage(page)}
        count={count}
        className="mt-0"
      >
        <div className="table-container relative">
          <div className="table-body-container ">
            <Table className="w-full">
              <Table.Head className="table-header">
                <Table.HeadCell className="table-cell">Customer</Table.HeadCell>
                <Table.HeadCell className="table-cell">City</Table.HeadCell>
                <Table.HeadCell className="table-cell">Date</Table.HeadCell>
                <Table.HeadCell className="table-cell">Total</Table.HeadCell>
                <Table.HeadCell className="table-cell">Status</Table.HeadCell>
                <Table.HeadCell className="table-cell">
                  <span className="sr-only">Actions</span>
                </Table.HeadCell>
              </Table.Head>

              <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentPageOrders.map((order) => {
                  return <TableItem key={order.id} order={order} />
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

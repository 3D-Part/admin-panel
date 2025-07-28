'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useOrdersStore } from '@/store/store'
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
  } = useOrdersStore()

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
  }, [currentPage, fetchOrdersData])

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsOpen(true)
  }

  const handleMessageClick = (order: Order) => {
    setSelectedOrder(order)
    setIsFormModalOpen(true)
  }

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderStatusModalOpen(true)
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
        onClick={() => handleOrderClick(order)}
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
                  handleStatusClick(order)
                }}
                className="cursor-pointer"
              >
                <OrderStatus status={status} />
              </div>
            ),
          },
        ]}
        actions={
          <div
            className="flex justify-end items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-xl cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleMessageClick(order)}
            >
              <BiMessageDetail />
            </div>
          </div>
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
      >
        <div className="overflow-x-auto relative min-h-[100px] table-container">
          <Table>
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell">Name</Table.HeadCell>
              <Table.HeadCell className="table-cell">Email</Table.HeadCell>
              <Table.HeadCell className="table-cell">City</Table.HeadCell>
              <Table.HeadCell className="table-cell">Date</Table.HeadCell>
              <Table.HeadCell className="table-cell">Price</Table.HeadCell>
              <Table.HeadCell className="table-cell">Status</Table.HeadCell>
              <Table.HeadCell className="table-cell"></Table.HeadCell>
            </Table.Head>

            {/* {!loader && ( */}
            <Table.Body className="divide-y">
              {currentPageOrders.map((order) => {
                return <TableItem key={order.id} order={order} />
              })}
            </Table.Body>
            {/* )} */}
          </Table>

          {loader && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${loaderBg}`}
            >
              <Loader />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
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

      {/* Mobile Modals */}
      {selectedOrder && (
        <>
          <OrderDetails
            isOpen={isOrderDetailsOpen}
            onClose={() => {
              setIsOrderDetailsOpen(false)
              setSelectedOrder(null)
            }}
            order={selectedOrder}
          />

          <OrderContactForm
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false)
              setSelectedOrder(null)
            }}
            initialValue={selectedOrder}
            setIsModalOpen={setIsFormModalOpen}
          />

          <OrderEditModal
            isOpen={isOrderStatusModalOpen}
            onClose={() => {
              setIsOrderStatusModalOpen(false)
              setSelectedOrder(null)
            }}
            initialValue={selectedOrder}
            setIsModalOpen={setIsOrderStatusModalOpen}
          />
        </>
      )}
    </>
  )
}

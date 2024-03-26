'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useOrdersStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData } from '@/shared/types'

export const OrdersTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    currentPageOrders,
    currentPage,
    itemsPerPage,
    fetchOrders,
    changeCurrentPage,
    totalPages,
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

  useEffect(() => {
    fetchOrdersData()
  }, [currentPage, fetchOrdersData])

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>City</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>

          {!loader && (
            <Table.Body className="divide-y">
              {currentPageOrders.map((order) => {
                return <TableItem key={order.id} order={order} />
              })}
            </Table.Body>
          )}
        </Table>
      </div>
      {loader && <Loader />}

      <Pagination
        className="mt-8"
        currentPage={currentPage}
        onPageChange={(page) => {
          changeCurrentPage(page)
        }}
        totalPages={totalPages}
      />
    </div>
  )
}

'use client'
import { tx } from '@/shared/i18n'
import { useCustomerProfiles } from '@/components/common/CustomerFlag/CustomerFlag'

import { Table } from 'flowbite-react'
import { Pagination } from '@/components/common/TablePagination/TablePagination'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useOrdersStore, useShopSettingsStore } from '@/store/store'
import { Loader, ResponsiveTableWrapper } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { StepLists, readStepLists } from '@/shared/helpers/billingOptions'

export const OrdersTable = () => {
  const [loader, setLoader] = useState(true)

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

  const { getShopSettings } = useShopSettingsStore()
  // the steps of orders and of offers; each row picks by its status
  const [stepLists, setStepLists] = useState<StepLists>({ orders: [], offers: [] })

  useEffect(() => {
    getShopSettings().then((data) =>
      setStepLists(readStepLists(data?.settings))
    )
  }, [getShopSettings])

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

  // the customer's flag shows on every one of their orders
  const profiles = useCustomerProfiles(currentPageOrders.map((o) => o.email))

  return (
    <>
      <ResponsiveTableWrapper
        tableOnPhone
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => changeCurrentPage(page)}
        count={count}
        className="mt-0"
      >
        <div className="table-container relative">
          <div className="table-body-container ">
            <Table className="w-full max-md:min-w-[900px] [&_th]:!px-3 [&_td]:!px-3">
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

        <div className="hidden md:flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
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
    </>
  )
}

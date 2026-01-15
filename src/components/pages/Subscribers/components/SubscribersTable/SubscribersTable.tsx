'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'flowbite-react'
import { TableItem } from './TableItem/TableItem'
import { useSubscribersSliceStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, Subscriber } from '@/shared/types'

export const SubscribersTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    fetchSubscribers,
    currentPageSubscribers,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useSubscribersSliceStore()

  const fetchSubscribersData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchSubscribers(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchSubscribers, itemsPerPage])

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  const loaderBg =
    currentPageSubscribers.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchSubscribersData()
  }, [currentPage, fetchSubscribersData])

  // Generate mobile cards
  const mobileCards = currentPageSubscribers.map((subscriber: Subscriber) => {
    const { email } = subscriber

    return (
      <MobileCardBuilder
        key={subscriber.id}
        title={email}
        subtitle="Subscriber"
        items={[
          {
            label: 'Email',
            value: email,
          },
        ]}
      />
    )
  })

  return (
    <ResponsiveTableWrapper
      mobileCards={mobileCards}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => changeCurrentPage(page)}
      count={count}
    >
      <div className="table-container relative">
        <div className="table-body-container ">
          <Table className="w-full">
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell">Email</Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageSubscribers.map((subscriber) => {
                return <TableItem key={subscriber.id} subscriber={subscriber} />
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
  )
}

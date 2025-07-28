'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, OrderEmail } from '@/shared/types'
import { useOrdersEmailsStore } from '@/store/store'
import { Pagination, Table } from 'flowbite-react'
import { TableItem } from './TableItem'

const EmailsTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    fetchOrdersEmails,
    currentPageEmails,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useOrdersEmailsStore()

  const fetchOrdersEmailsData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }

    const data = await fetchOrdersEmails(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchOrdersEmails, itemsPerPage])

  const loaderBg =
    currentPageEmails.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchOrdersEmailsData()
  }, [currentPage, fetchOrdersEmailsData])

  // Generate mobile cards
  const mobileCards = currentPageEmails.map((email: OrderEmail) => {
    return (
      <MobileCardBuilder
        key={email}
        title={email}
        subtitle="Order Email"
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
      <div className="relative overflow-x-auto min-h-[100px] table-container">
        <Table>
          <Table.Head className="table-header">
            <Table.HeadCell className="table-cell">Email</Table.HeadCell>
          </Table.Head>
          {/* {!loader && ( */}
          <Table.Body className="divide-y">
            {currentPageEmails.length > 0 &&
              currentPageEmails.map((email) => {
                return <TableItem key={email} email={email} />
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
  )
}

export default EmailsTable

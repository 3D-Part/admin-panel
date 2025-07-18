'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader } from '@/components/common'
import { PaginationData } from '@/shared/types'
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
    currentPageEmails.length > 0 ? 'bg-black/30' : 'bg-transparent'

  useEffect(() => {
    fetchOrdersEmailsData()
  }, [currentPage, fetchOrdersEmailsData])

  console.log('Tests')

  return (
    <div>
      <div className="relative overflow-x-auto min-h-[100px]">
        <Table>
          <Table.Head>
            <Table.HeadCell>Email</Table.HeadCell>
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

      <div className="flex justify-between gap-4 items-center w-full">
        <Pagination
          className="mt-8"
          currentPage={currentPage}
          onPageChange={(page) => {
            changeCurrentPage(page)
          }}
          totalPages={totalPages}
        />

        <p className="text-white/50 text-sm">
          Total: {totalPages * itemsPerPage}
        </p>
      </div>
    </div>
  )
}

export default EmailsTable

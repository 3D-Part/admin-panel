'use client' // This is a client component 👈🏽

import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'flowbite-react'
import { TableItem } from './TableItem/TableItem'
import { useSubscribersSliceStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData } from '@/shared/types'

export const SubscribersTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    fetchSubscribers,
    currentPageSubscribers,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
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
    currentPageSubscribers.length > 0 ? 'bg-black/30' : 'bg-transparent'

  useEffect(() => {
    fetchSubscribersData()
  }, [currentPage, fetchSubscribersData])

  return (
    <div className="mt-8">
      <div className="relative overflow-x-auto min-h-[100px]">
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            {/* <Table.HeadCell>
                        <span className="sr-only">Edit or Remove</span>
                    </Table.HeadCell> */}
          </Table.Head>
          {/* {!loader && ( */}
          <Table.Body className="divide-y">
            {currentPageSubscribers.length > 0 &&
              currentPageSubscribers.map((subscriber) => {
                return <TableItem key={subscriber.id} subscriber={subscriber} />
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

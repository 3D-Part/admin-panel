'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useSalesSliceStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, PromoCode, Sale } from '@/shared/types'

type SalesTableType = {
  onWarningModalOpen: (sale: Sale) => void
}

export const SalesTable: React.FC<SalesTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchSales,
    currentPageSales,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
  } = useSalesSliceStore()

  const fetchPromoCodesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchSales(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchSales, itemsPerPage])

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  const loaderBg =
    currentPageSales.length > 0 ? 'bg-black/30' : 'bg-transparent'

  useEffect(() => {
    fetchPromoCodesData()
  }, [currentPage, fetchPromoCodesData])

  return (
    <div className="mt-8">
      <div className="relative overflow-x-auto min-h-[100px]">
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Start</Table.HeadCell>
            <Table.HeadCell>End</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Edit or Remove</span>
            </Table.HeadCell>
          </Table.Head>
          {/* {!loader && ( */}
          <Table.Body className="divide-y">
            {currentPageSales.length > 0 &&
              currentPageSales.map((sale) => {
                return (
                  <TableItem
                    onWarningModalOpen={onWarningModalOpen}
                    key={sale.id}
                    sale={sale}
                  />
                )
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

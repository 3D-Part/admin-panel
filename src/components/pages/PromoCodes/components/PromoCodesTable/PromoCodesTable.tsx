'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { usePromoCodesSliceStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, PromoCode } from '@/shared/types'

type PromoCodesTableType = {
  onWarningModalOpen: (promocode: PromoCode) => void
}

export const PromoCodesTable: React.FC<PromoCodesTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchPromoCodes,
    currentPagePromoCodes,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = usePromoCodesSliceStore()

  const fetchPromoCodesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchPromoCodes(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchPromoCodes, itemsPerPage])

  const loaderBg =
    currentPagePromoCodes.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  useEffect(() => {
    fetchPromoCodesData()
  }, [currentPage, fetchPromoCodesData])

  return (
    <div className="mt-8">
      <div className="relative overflow-x-auto min-h-[100px] table-container">
        <Table>
          <Table.Head className="table-header">
            <Table.HeadCell className="table-cell">Name</Table.HeadCell>
            <Table.HeadCell className="table-cell">Start</Table.HeadCell>
            <Table.HeadCell className="table-cell">End</Table.HeadCell>
            <Table.HeadCell className="table-cell">Discount</Table.HeadCell>
            <Table.HeadCell className="table-cell">
              <span className="sr-only">Edit or Remove</span>
            </Table.HeadCell>
          </Table.Head>
          {/* {!loader && ( */}
          <Table.Body className="divide-y">
            {currentPagePromoCodes.length > 0 &&
              currentPagePromoCodes.map((promocode) => {
                return (
                  <TableItem
                    onWarningModalOpen={onWarningModalOpen}
                    key={promocode.id}
                    promocode={promocode}
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

        <p className="table-total-text text-sm">Total: {count}</p>
      </div>
    </div>
  )
}

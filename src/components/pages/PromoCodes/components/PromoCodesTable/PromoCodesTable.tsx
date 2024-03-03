'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { usePromoCodesSliceStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData } from '@/shared/types'

export const PromoCodesTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    fetchPromoCodes,
    currentPagePromoCodes,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
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

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  useEffect(() => {
    fetchPromoCodesData()
  }, [currentPage, fetchPromoCodesData])

  return (
    <div className="mt-8">
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Start</Table.HeadCell>
          <Table.HeadCell>End</Table.HeadCell>
          <Table.HeadCell>Discount</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Edit or Remove</span>
          </Table.HeadCell>
        </Table.Head>
        {!loader && (
          <Table.Body className="divide-y">
            {currentPagePromoCodes.length > 0 &&
              currentPagePromoCodes.map((promocode) => {
                return <TableItem key={promocode.id} promocode={promocode} />
              })}
          </Table.Body>
        )}
      </Table>
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

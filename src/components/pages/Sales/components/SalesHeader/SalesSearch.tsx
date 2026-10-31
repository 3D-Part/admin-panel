'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useSalesSliceStore } from '@/store/store'
import { Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

const SalesSearch = () => {
  const [loader, setLoader] = useState(false)

  const { itemsPerPage, fetchSales, changeCurrentPage, changeSalesFilter } =
    useSalesSliceStore()

  const fetchSalesData = useCallback(
    async (value: string) => {
      changeCurrentPage(1)
      changeSalesFilter({
        filters: {
          name: {
            like: `%${value}%`,
          },
        },
      })

      setLoader(true)
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      }
      await fetchSales(paginationData)
      setLoader(false)
    },
    [changeCurrentPage, changeSalesFilter, fetchSales, itemsPerPage]
  )

  return (
    <div className="flex gap-8 items-center">
      <Search getData={fetchSalesData} />
      {loader && <Spinner aria-label="Loading..." size="lg" />}
    </div>
  )
}

export default SalesSearch

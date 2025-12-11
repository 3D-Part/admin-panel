'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useSubscribersSliceStore } from '@/store/store'
import { Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

const SubscribersSearch = () => {
  const [loader, setLoader] = useState(false)

  const {
    itemsPerPage,
    fetchSubscribers,
    changeCurrentPage,
    changeSubscribersFilter,
  } = useSubscribersSliceStore()

  const fetchSubscribersData = useCallback(
    async (value: string) => {
      changeCurrentPage(1)

      const filters = value
        ? {
            filters: {
              email: {
                like: `%${value}%`,
              },
            },
          }
        : {}

      changeSubscribersFilter(filters)

      setLoader(true)
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      }
      const data = await fetchSubscribers(paginationData)
      if (data) {
        setLoader(false)
      } else {
        setLoader(true)
      }
    },
    [changeCurrentPage, changeSubscribersFilter, fetchSubscribers, itemsPerPage]
  )

  return (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <div className="flex-1 md:flex-none min-w-0">
        <Search getData={fetchSubscribersData} />
      </div>
      {loader && <Spinner aria-label="Loading..." size="sm" />}
    </div>
  )
}

export default SubscribersSearch

'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useUsersSliceStore } from '@/store/store'
import { Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

const UsersSearch = () => {
  const [loader, setLoader] = useState(false)

  const { itemsPerPage, fetchUsers, changeCurrentPage, changeUsersFilter } =
    useUsersSliceStore()

  const fetchUsersData = useCallback(
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

      changeUsersFilter(filters)

      setLoader(true)
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      }
      const data = await fetchUsers(paginationData)
      if (data) {
        setLoader(false)
      } else {
        setLoader(true)
      }
    },
    [changeCurrentPage, changeUsersFilter, fetchUsers, itemsPerPage]
  )

  return (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <div className="flex-1 md:flex-none min-w-0">
        <Search getData={fetchUsersData} />
      </div>
      {loader && <Spinner aria-label="Loading..." size="sm" />}
    </div>
  )
}

export default UsersSearch

'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useUsersSliceStore } from '@/store/store'
import { Dropdown, Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

type SearchField = 'email' | 'fullName'

const searchFieldLabels: Record<SearchField, string> = {
  email: 'EMAIL',
  fullName: 'FULL NAME',
}

const UsersSearch = () => {
  const [loader, setLoader] = useState(false)
  const [searchBy, setSearchBy] = useState<SearchField>('email')

  const { itemsPerPage, fetchUsers, changeCurrentPage, changeUsersFilter } =
    useUsersSliceStore()

  const fetchUsersData = useCallback(
    async (value: string) => {
      changeCurrentPage(1)

      const filters = value
        ? {
            filters: {
              [searchBy]: {
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
    [changeCurrentPage, changeUsersFilter, fetchUsers, itemsPerPage, searchBy]
  )

  return (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <Dropdown dismissOnClick label={searchFieldLabels[searchBy]} size="sm">
        <Dropdown.Item onClick={() => setSearchBy('email')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>EMAIL</p>
          </span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setSearchBy('fullName')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>FULL NAME</p>
          </span>
        </Dropdown.Item>
      </Dropdown>
      <div className="flex-1 md:flex-none min-w-0">
        <Search getData={fetchUsersData} />
      </div>
      {loader && <Spinner aria-label="Loading..." size="sm" />}
    </div>
  )
}

export default UsersSearch

'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useOrdersStore } from '@/store/store'
import { Dropdown, Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

type SearchField = 'orderNumber' | 'fullName' | 'city' | 'status'

const searchFieldLabels: Record<SearchField, string> = {
  orderNumber: 'ORDER #',
  fullName: 'FULL NAME',
  city: 'CITY',
  status: 'STATUS',
}

const OrdersSearch = () => {
  const [loader, setLoader] = useState(false)
  const [searchBy, setSearchBy] = useState<SearchField>('orderNumber')

  const { itemsPerPage, fetchOrders, changeCurrentPage, changeOrderFilter } =
    useOrdersStore()

  const fetchOrdersData = useCallback(
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

      changeOrderFilter(filters)

      setLoader(true)
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      }
      const data = await fetchOrders(paginationData)
      if (data) {
        setLoader(false)
      } else {
        setLoader(true)
      }
    },
    [changeCurrentPage, fetchOrders, itemsPerPage, searchBy, changeOrderFilter]
  )

  return (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <Dropdown dismissOnClick label={searchFieldLabels[searchBy]} size="sm">
        <Dropdown.Item onClick={() => setSearchBy('orderNumber')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>ORDER #</p>
          </span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setSearchBy('fullName')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>FULL NAME</p>
          </span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setSearchBy('city')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>CITY</p>
          </span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setSearchBy('status')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>STATUS</p>
          </span>
        </Dropdown.Item>
      </Dropdown>
      <div className="flex-1 md:flex-none min-w-0">
        <Search getData={fetchOrdersData} />
      </div>
      {loader && <Spinner aria-label="Loading..." size="sm" />}
    </div>
  )
}

export default OrdersSearch

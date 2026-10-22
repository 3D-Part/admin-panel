'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useOrdersStore } from '@/store/store'
import { Dropdown, Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

type SearchField =
  | 'orderNumber'
  | 'fullName'
  | 'companyName'
  | 'jib'
  | 'city'
  | 'status'

const searchFieldLabels: Record<SearchField, string> = {
  orderNumber: 'ORDER #',
  fullName: 'FULL NAME',
  companyName: 'COMPANY',
  jib: 'JIB',
  city: 'CITY',
  status: 'STATUS',
}

const searchFields = Object.keys(searchFieldLabels) as SearchField[]

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
        {searchFields.map((field) => (
          <Dropdown.Item key={field} onClick={() => setSearchBy(field)}>
            <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
              <p>{searchFieldLabels[field]}</p>
            </span>
          </Dropdown.Item>
        ))}
      </Dropdown>
      <div className="flex-1 md:flex-none min-w-0">
        <Search getData={fetchOrdersData} />
      </div>
      {loader && <Spinner aria-label="Loading..." size="sm" />}
    </div>
  )
}

export default OrdersSearch

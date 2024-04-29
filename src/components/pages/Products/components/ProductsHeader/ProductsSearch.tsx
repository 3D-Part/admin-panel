'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useProductsStore } from '@/store/store'
import { Dropdown, Spinner } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'

const ProductsSearch = () => {
  const [loader, setLoader] = useState(false)

  const [searchBy, setSearchBy] = useState<'name' | 'sku'>('name')

  const {
    itemsPerPage,
    fetchProducts,
    changeCurrentPage,
    changeProductFilter,
  } = useProductsStore()

  const fetchProductsData = useCallback(
    async (value: string) => {
      changeCurrentPage(1)

      const filters = {
        filters: {
          [searchBy]: {
            like: `%${value}%`,
          },
        },
      }

      changeProductFilter(filters)

      setLoader(true)
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      }
      const data = await fetchProducts(paginationData)
      if (data) {
        setLoader(false)
      } else {
        setLoader(true)
      }
    },
    [changeCurrentPage, fetchProducts, itemsPerPage, searchBy]
  )

  return (
    <div className="flex gap-2 items-center">
      <Dropdown dismissOnClick label={searchBy}>
        <Dropdown.Item onClick={() => setSearchBy('name')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>NAME</p>
          </span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setSearchBy('sku')}>
          <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
            <p>SKU</p>
          </span>
        </Dropdown.Item>
      </Dropdown>
      <Search getData={fetchProductsData} />
      {loader && <Spinner aria-label="Loading..." size="lg" />}
    </div>
  )
}

export default ProductsSearch

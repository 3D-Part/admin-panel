'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useCategoryStore, useProductsStore } from '@/store/store'
import { Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

const CategoriesSearch = () => {
  const [loader, setLoader] = useState(false)

  const {
    itemsPerPage,
    fetchCategories,
    changeCurrentPage,
    changeCategoryFilter,
  } = useCategoryStore()

  const fetchCategoriesData = useCallback(
    async (value: string) => {
      changeCurrentPage(1)

      const filters = {
        filters: {
          name: {
            like: `%${value}%`,
          },
        },
      }

      changeCategoryFilter(filters)

      setLoader(true)
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      }
      const data = await fetchCategories(paginationData)
      if (data) {
        setLoader(false)
      } else {
        setLoader(true)
      }
    },
    [changeCurrentPage, itemsPerPage]
  )

  return (
    <div className="flex gap-8 items-center">
      <Search getData={fetchCategoriesData} />
      {loader && <Spinner aria-label="Loading..." size="lg" />}
    </div>
  )
}

export default CategoriesSearch

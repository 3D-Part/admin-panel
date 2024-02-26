'use client'

import { Search } from '@/components/common'
import { PaginationData } from '@/shared/types'
import { useCategoryStore, useManufactureStore } from '@/store/store'
import { Spinner } from 'flowbite-react'
import React, { useCallback, useState } from 'react'

const SubscribersSearch = () => {
    const [loader, setLoader] = useState(false)

    const {
        itemsPerPage,
        fetchManufactures,
        changeCurrentPage,
        changeManufactureFilter,
    } = useManufactureStore()

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

            changeManufactureFilter(filters)

            setLoader(true)
            const paginationData: PaginationData = {
                offset: 0,
                limit: itemsPerPage,
            }
            const data = await fetchManufactures(paginationData)
            if (data) {
                setLoader(false)
            } else {
                setLoader(true)
            }
        },
        [
            changeCurrentPage,
            changeManufactureFilter,
            fetchManufactures,
            itemsPerPage,
        ]
    )

    return (
        <div className="flex gap-8 items-center">
            <Search getData={fetchCategoriesData} />
            {loader && <Spinner aria-label="Loading..." size="lg" />}
        </div>
    )
}

export default SubscribersSearch

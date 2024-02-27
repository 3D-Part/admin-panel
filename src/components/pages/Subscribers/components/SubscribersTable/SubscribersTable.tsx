'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useManufactureStore, useSubscribersSliceStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, ManufacturerData } from '@/shared/types'

export const SubscribersTable = () => {
    const [loader, setLoader] = useState(true)

    const {
        fetchSubscribers,
        currentPageSubscribers,
        currentPage,
        changeCurrentPage,
        itemsPerPage,
        totalPages,
    } = useSubscribersSliceStore()

    const fetchSubscribersData = useCallback(async () => {
        setLoader(true)
        const paginationData: PaginationData = {
            offset: (currentPage - 1) * itemsPerPage,
            limit: itemsPerPage,
        }
        const data = await fetchSubscribers(paginationData)
        if (data) {
            setLoader(false)
        } else {
            setLoader(true)
        }
    }, [currentPage, fetchSubscribers, itemsPerPage])

    // useEffect(() => {
    //   changeManufactureFilter({});
    // }, []);

    useEffect(() => {
        fetchSubscribersData()
    }, [currentPage, fetchSubscribersData])

    return (
        <div className="">
            <Table>
                <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    {/* <Table.HeadCell>
                        <span className="sr-only">Edit or Remove</span>
                    </Table.HeadCell> */}
                </Table.Head>
                {!loader && (
                    <Table.Body className="divide-y">
                        {currentPageSubscribers.length > 0 &&
                            currentPageSubscribers.map((subscriber) => {
                                return (
                                    <TableItem
                                        key={subscriber.id}
                                        subscriber={subscriber}
                                    />
                                )
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

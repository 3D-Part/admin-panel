'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useUsersSliceStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData } from '@/shared/types'

export const UsersTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    fetchUsers,
    currentPageUsers,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
  } = useUsersSliceStore()

  const fetchUsersData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchUsers(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchUsers, itemsPerPage])

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  useEffect(() => {
    fetchUsersData()
  }, [currentPage, fetchUsersData])

  return (
    <div className="">
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Phone</Table.HeadCell>
            <Table.HeadCell>City</Table.HeadCell>
            <Table.HeadCell>street</Table.HeadCell>
            {/* <Table.HeadCell>
                        <span className="sr-only">Edit or Remove</span>
                    </Table.HeadCell> */}
          </Table.Head>
          {!loader && (
            <Table.Body className="divide-y">
              {currentPageUsers.length > 0 &&
                currentPageUsers.map((user) => {
                  return <TableItem key={user.id} user={user} />
                })}
            </Table.Body>
          )}
        </Table>
      </div>
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

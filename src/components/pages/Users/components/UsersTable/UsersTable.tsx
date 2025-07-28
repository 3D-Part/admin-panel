'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useUsersSliceStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, User } from '@/shared/types'
import UserDetails from '../UserDetails/UserDetails'

export const UsersTable = () => {
  const [loader, setLoader] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

  const {
    fetchUsers,
    currentPageUsers,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
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

  const loaderBg =
    currentPageUsers.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchUsersData()
  }, [currentPage, fetchUsersData])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  // Generate mobile cards
  const mobileCards = currentPageUsers.map((user) => {
    const {
      fullName,
      email,
      phone,
      city,
      street,
      availablePoints,
      usedPoints,
    } = user

    return (
      <MobileCardBuilder
        key={user.id}
        title={fullName}
        subtitle={email}
        onClick={() => handleUserClick(user)}
        items={[
          {
            label: 'Phone',
            value: phone || (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
          {
            label: 'City',
            value: city || (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
          {
            label: 'Street',
            value: street || (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
          {
            label: 'Available Points',
            value: (
              <span className="font-semibold text-green-600 dark:text-green-400">
                {availablePoints}
              </span>
            ),
          },
          {
            label: 'Used Points',
            value: (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {usedPoints}
              </span>
            ),
          },
        ]}
      />
    )
  })

  return (
    <>
      <ResponsiveTableWrapper
        mobileCards={mobileCards}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => changeCurrentPage(page)}
        count={count}
      >
        <div className="relative overflow-x-auto min-h-[100px] table-container">
          <Table>
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell">Name</Table.HeadCell>
              <Table.HeadCell className="table-cell">Email</Table.HeadCell>
              <Table.HeadCell className="table-cell">Phone</Table.HeadCell>
              <Table.HeadCell className="table-cell">City</Table.HeadCell>
              <Table.HeadCell className="table-cell">Street</Table.HeadCell>
              <Table.HeadCell className="table-cell">Points</Table.HeadCell>
              <Table.HeadCell className="table-cell">
                Used points
              </Table.HeadCell>
              {/* <Table.HeadCell>
                        <span className="sr-only">Edit or Remove</span>
                    </Table.HeadCell> */}
            </Table.Head>
            {/* {!loader && ( */}
            <Table.Body className="divide-y">
              {currentPageUsers.length > 0 &&
                currentPageUsers.map((user) => {
                  return <TableItem key={user.id} user={user} />
                })}
            </Table.Body>
            {/* )} */}
          </Table>
          {loader && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${loaderBg}`}
            >
              <Loader />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <Pagination
            currentPage={currentPage}
            onPageChange={(page) => {
              changeCurrentPage(page)
            }}
            totalPages={totalPages}
          />

          <p className="table-total-text text-sm">Total: {count}</p>
        </div>
      </ResponsiveTableWrapper>

      {/* Mobile User Details Modal */}
      {selectedUser && (
        <UserDetails
          isOpen={isUserDetailsOpen}
          onClose={() => {
            setIsUserDetailsOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />
      )}
    </>
  )
}

'use client'

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
    sortFiled,
    sortOrder,
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
  }, [currentPage, fetchUsersData, sortFiled, sortOrder])

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
            label: 'Points',
            value: (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {availablePoints}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    available
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {usedPoints}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">
                    used
                  </span>
                </div>
              </div>
            ),
          },
        ]}
      />
    )
  })

  return (
    <ResponsiveTableWrapper
      mobileCards={mobileCards}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => changeCurrentPage(page)}
      count={count}
    >
      <div className="table-container relative">
        <div className="table-body-container ">
          <Table className="w-full">
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell w-1/6">Name</Table.HeadCell>
              <Table.HeadCell className="table-cell w-2/5">
                Email
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/8">
                Phone
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/8">City</Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">
                Points
              </Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageUsers.map((user) => {
                return <TableItem key={user.id} user={user} />
              })}
            </Table.Body>
          </Table>

          {loader && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${loaderBg} rounded-xl`}
            >
              <Loader />
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <Pagination
          currentPage={currentPage}
          onPageChange={(page) => {
            changeCurrentPage(page)
          }}
          totalPages={totalPages}
        />

        <p className="table-total-text text-sm">Total: {count}</p>
      </div>

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          isOpen={isUserDetailsOpen}
          onClose={() => {
            setIsUserDetailsOpen(false)
            setSelectedUser(null)
          }}
          onUserUpdated={() => {
            fetchUsersData()
          }}
        />
      )}
    </ResponsiveTableWrapper>
  )
}

'use client'

import { User } from '@/shared/types'
import { Table } from 'flowbite-react'
import React, { useState } from 'react'
import UserDetails from '../../UserDetails/UserDetails'

type TableItemType = {
  user: User
}

export const TableItem: React.FC<TableItemType> = ({ user }) => {
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

  const { fullName, email, phone, city, street, availablePoints, usedPoints } =
    user

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          onClick={() => setIsUserDetailsOpen(true)}
          className="cursor-pointer whitespace-nowrap font-medium table-cell w-1/6"
        >
          <div className="flex justify-start items-center gap-6">
            {fullName}
          </div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell w-2/5">
          <div className="flex justify-start items-center gap-6 ">{email}</div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell w-1/8">
          <div className="flex justify-start items-center gap-6">{phone}</div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell w-1/8">
          <div className="flex justify-start items-center gap-6">{city}</div>
        </Table.Cell>

        <Table.Cell className="whitespace-nowrap font-medium table-cell w-1/6">
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
        </Table.Cell>

        {/* <Table.Cell>
            <div className="flex justify-end items-center gap-8">
                <span className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                    <p>Edit</p>
                </span>
                <span className="font-medium text-red-500 hover:underline dark:text-red-500">
                    <p>Remove</p>
                </span>
            </div>
        </Table.Cell> */}
      </Table.Row>

      <UserDetails
        isOpen={isUserDetailsOpen}
        onClose={() => setIsUserDetailsOpen(false)}
        user={user}
      />
    </>
  )
}

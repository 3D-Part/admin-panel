'use client'

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useEmployeesSliceStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, User } from '@/shared/types'

export const EmployeesTable = () => {
  const [loader, setLoader] = useState(true)

  const {
    fetchEmployees,
    currentPageEmployees,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useEmployeesSliceStore()

  const fetchEmployeesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchEmployees(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchEmployees, itemsPerPage])

  const loaderBg =
    currentPageEmployees.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchEmployeesData()
  }, [currentPage, fetchEmployeesData])

  // Generate mobile cards
  const mobileCards = currentPageEmployees.map((employee: User) => {
    const { fullName, email } = employee

    return (
      <MobileCardBuilder
        key={employee.id}
        title={fullName}
        subtitle={email}
        items={[
          {
            label: 'Email',
            value: email,
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
      <div className="table-container">
        <div className="table-body-container relative">
          <Table className="w-full">
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell">Name</Table.HeadCell>
              <Table.HeadCell className="table-cell">Email</Table.HeadCell>
              <Table.HeadCell className="table-cell">
                <span className="sr-only">Actions</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageEmployees.map((employee) => {
                return <TableItem key={employee.id} employee={employee} />
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
    </ResponsiveTableWrapper>
  )
}

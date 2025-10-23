'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useManufactureStore, useCurrentUserStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, ManufacturerData } from '@/shared/types'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type ManufacturesTableType = {
  onWarningModalOpen: (manufacture: ManufacturerData) => void
  openEditModal: (manufacture: ManufacturerData) => void
}

export const ManufacturesTable: React.FC<ManufacturesTableType> = ({
  onWarningModalOpen,
  openEditModal,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchManufactures,
    currentPageManufactures,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useManufactureStore()

  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.MANUFACTURER_WRITE,
    currentUser?.role
  )

  const fetchManufacturesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchManufactures(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchManufactures, itemsPerPage])

  const loaderBg =
    currentPageManufactures.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  useEffect(() => {
    fetchManufacturesData()
  }, [currentPage, fetchManufacturesData])

  // Generate mobile cards
  const mobileCards = currentPageManufactures.map(
    (manufacture: ManufacturerData) => {
      const { name } = manufacture

      return (
        <MobileCardBuilder
          key={manufacture.id}
          title={name}
          onClick={
            hasWritePermission ? () => openEditModal(manufacture) : undefined
          }
          items={[]}
          actions={
            hasWritePermission ? (
              <div className="flex justify-end items-center gap-4">
                <span
                  onClick={() => openEditModal(manufacture)}
                  className="font-medium table-action-link cursor-pointer hover:underline"
                >
                  Edit
                </span>
                <span
                  onClick={() => onWarningModalOpen(manufacture)}
                  className="font-medium table-action-danger cursor-pointer hover:underline"
                >
                  Remove
                </span>
              </div>
            ) : null
          }
        />
      )
    }
  )

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

              <Table.HeadCell className="table-cell">
                <span className="sr-only">Actions</span>
              </Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageManufactures.map((manufacture) => {
                return (
                  <TableItem
                    key={manufacture.id}
                    manufacture={manufacture}
                    onWarningModalOpen={onWarningModalOpen}
                    openEditModal={openEditModal}
                  />
                )
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

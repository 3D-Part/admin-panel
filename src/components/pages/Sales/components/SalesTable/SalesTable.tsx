'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import {
  useSalesSliceStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, Sale } from '@/shared/types'
import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import EditSaleModal from '../Modals/EditSaleModal/EditSaleModal'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type SalesTableType = {
  onWarningModalOpen: (sale: Sale) => void
}

export const SalesTable: React.FC<SalesTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)
  const { changeIsSaleEditModalOpen, isSaleEditModalOpen } = useUISliceStore()

  const {
    fetchSales,
    currentPageSales,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
    changeActiveSale,
  } = useSalesSliceStore()

  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.SALE_WRITE,
    currentUser?.role
  )

  const fetchPromoCodesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchSales(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchSales, itemsPerPage])

  const loaderBg =
    currentPageSales.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchPromoCodesData()
  }, [currentPage, fetchPromoCodesData])

  const handleEditSale = (sale: Sale) => {
    if (!hasWritePermission) {
      return
    }
    changeActiveSale(sale)
    changeIsSaleEditModalOpen(true)
  }

  // Generate mobile cards
  const mobileCards = currentPageSales.map((sale) => {
    const { startsAt, endsAt, name } = sale

    const startTime = dateTimeFormat(startsAt, true)
    const endTime = dateTimeFormat(endsAt, true)

    return (
      <MobileCardBuilder
        key={sale.id}
        title={name}
        onClick={hasWritePermission ? () => handleEditSale(sale) : undefined}
        items={[
          {
            label: 'Start Date',
            value: (
              <span className="text-gray-700 dark:text-gray-300">
                {startTime}
              </span>
            ),
          },
          {
            label: 'End Date',
            value: (
              <span className="text-gray-700 dark:text-gray-300">
                {endTime}
              </span>
            ),
          },
        ]}
        actions={
          hasWritePermission ? (
            <div
              className="flex justify-end items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                onClick={() => handleEditSale(sale)}
                className="font-medium table-action-link cursor-pointer hover:underline"
              >
                Edit
              </span>
              <span
                onClick={() => onWarningModalOpen(sale)}
                className="font-medium table-action-danger cursor-pointer hover:underline"
              >
                Remove
              </span>
            </div>
          ) : null
        }
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
        <Table className="w-full">
          <Table.Head className="table-header">
            <Table.HeadCell className="table-cell">Name</Table.HeadCell>
            <Table.HeadCell className="table-cell">Start Date</Table.HeadCell>
            <Table.HeadCell className="table-cell">End Date</Table.HeadCell>
            <Table.HeadCell className="table-cell">
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>
        </Table>

        <div className="table-body-container relative">
          <Table className="w-full">
            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageSales.map((sale) => {
                return (
                  <TableItem
                    key={sale.id}
                    sale={sale}
                    onWarningModalOpen={onWarningModalOpen}
                  />
                )
              })}
            </Table.Body>
          </Table>
        </div>
        {loader && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${loaderBg} rounded-xl`}
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
  )
}

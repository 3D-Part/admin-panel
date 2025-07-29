'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { usePromoCodesSliceStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, PromoCode } from '@/shared/types'
import dateTimeFormat from '@/shared/helpers/dateTimeFormat'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'

type PromoCodesTableType = {
  onWarningModalOpen: (promocode: PromoCode) => void
}

export const PromoCodesTable: React.FC<PromoCodesTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)
  const router = useRouter()

  const {
    fetchPromoCodes,
    currentPagePromoCodes,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
    changeActivePromoCode,
  } = usePromoCodesSliceStore()

  const fetchPromoCodesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchPromoCodes(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchPromoCodes, itemsPerPage])

  const loaderBg =
    currentPagePromoCodes.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  useEffect(() => {
    fetchPromoCodesData()
  }, [currentPage, fetchPromoCodesData])

  const handleEditPromoCode = (promocode: PromoCode) => {
    changeActivePromoCode(promocode)
    router.push(URLPartsEnum.EditPromoCode)
  }

  // Generate mobile cards
  const mobileCards = currentPagePromoCodes.map((promocode) => {
    const { startsAt, endsAt, code, discountPercentage } = promocode

    const startTime = dateTimeFormat(startsAt, true)
    const endTime = dateTimeFormat(endsAt, true)

    return (
      <MobileCardBuilder
        key={promocode.id}
        title={code}
        subtitle={`${discountPercentage}% discount`}
        onClick={() => handleEditPromoCode(promocode)}
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
          {
            label: 'Discount',
            value: (
              <span className="font-semibold text-green-600 dark:text-green-400">
                {discountPercentage}%
              </span>
            ),
          },
        ]}
        actions={
          <div
            className="flex justify-end items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              onClick={() => handleEditPromoCode(promocode)}
              className="font-medium table-action-link cursor-pointer hover:underline"
            >
              Edit
            </span>
            <span
              onClick={() => onWarningModalOpen(promocode)}
              className="font-medium table-action-danger cursor-pointer hover:underline"
            >
              Remove
            </span>
          </div>
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
        <Table className="w-full table-fixed">
          <Table.Head className="table-header">
            <Table.HeadCell className="table-cell">Code</Table.HeadCell>
            <Table.HeadCell className="table-cell">Discount</Table.HeadCell>
            <Table.HeadCell className="table-cell">Start Date</Table.HeadCell>
            <Table.HeadCell className="table-cell">End Date</Table.HeadCell>
            <Table.HeadCell className="table-cell">
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>
        </Table>

        <div className="table-body-container relative">
          <Table className="w-full table-fixed">
            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPagePromoCodes.map((promoCode) => {
                return (
                  <TableItem
                    key={promoCode.id}
                    promocode={promoCode}
                    onWarningModalOpen={onWarningModalOpen}
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

'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useCategoryStore, useCurrentUserStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, CategoryData } from '@/shared/types'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type CategoriesTableType = {
  onWarningModalOpen: (category: CategoryData) => void
  openEditModal: (category: CategoryData) => void
}

export const CategoriesTable: React.FC<CategoriesTableType> = ({
  onWarningModalOpen,
  openEditModal,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchCategories,
    currentPageCategories,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useCategoryStore()

  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.CATEGORY_WRITE,
    currentUser?.role
  )

  const fetchCategoriesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchCategories(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchCategories, itemsPerPage])

  const loaderBg =
    currentPageCategories.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchCategoriesData()
  }, [currentPage, fetchCategoriesData])

  // Generate mobile cards
  const mobileCards = currentPageCategories.map((category) => {
    const { name, slug, category: parentCategory } = category

    return (
      <MobileCardBuilder
        key={category.id}
        title={name}
        onClick={hasWritePermission ? () => openEditModal(category) : undefined}
        items={[
          {
            label: 'Parent Category',
            value: parentCategory ? (
              <span className="text-gray-700 dark:text-gray-300">
                {parentCategory.name}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
        ]}
        actions={
          hasWritePermission ? (
            <div className="flex justify-end items-center gap-4">
              <span
                onClick={() => openEditModal(category)}
                className="font-medium table-action-link cursor-pointer hover:underline"
              >
                Edit
              </span>
              <span
                onClick={() => onWarningModalOpen(category)}
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
            <Table.HeadCell className="table-cell">Category</Table.HeadCell>

            <Table.HeadCell className="table-cell">
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>
        </Table>

        <div className="table-body-container relative">
          <Table className="w-full">
            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageCategories.map((category) => {
                return (
                  <TableItem
                    key={category.id}
                    category={category}
                    onWarningModalOpen={onWarningModalOpen}
                    openEditModal={openEditModal}
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

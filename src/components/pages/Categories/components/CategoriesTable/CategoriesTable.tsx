'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useCategoryStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, CategoryData } from '@/shared/types'

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
    changeCategoryFilter,
  } = useCategoryStore()

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

  useEffect(() => {
    changeCategoryFilter({})
  }, [])

  useEffect(() => {
    fetchCategoriesData()
  }, [currentPage, fetchCategoriesData])

  return (
    <div className="mt-8">
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Parent</Table.HeadCell>
          <Table.HeadCell>URL Slug</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Edit or Remove</span>
          </Table.HeadCell>
        </Table.Head>
        {!loader && (
          <Table.Body className="divide-y">
            {currentPageCategories.length > 0 &&
              currentPageCategories.map((category) => {
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

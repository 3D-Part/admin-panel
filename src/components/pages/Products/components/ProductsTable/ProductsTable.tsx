'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useProductsStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, ProductData } from '@/shared/types'

type ProductsTableType = {
  onWarningModalOpen: (product: ProductData) => void
}

export const ProductsTable: React.FC<ProductsTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    currentPageProducts,
    currentPage,
    itemsPerPage,
    fetchProducts,
    changeCurrentPage,
    totalPages,
    count,
    changeProductFilter,
  } = useProductsStore()

  useEffect(() => {
    changeProductFilter({})
  }, [])

  const fetchProductsData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchProducts(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchProducts, itemsPerPage])

  const loaderBg =
    currentPageProducts.length > 0
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
      : 'bg-transparent'

  useEffect(() => {
    fetchProductsData()
  }, [currentPage, fetchProductsData])

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <div className="mt-8">
      <div className="overflow-x-auto relative min-h-[100px] table-container">
        <Table className="w-full">
          <Table.Head className="table-header">
            {/* <Table.HeadCell /> */}
            <Table.HeadCell className="table-cell">Name</Table.HeadCell>
            <Table.HeadCell className="table-cell">Category</Table.HeadCell>
            <Table.HeadCell className="table-cell">Manufacturer</Table.HeadCell>
            <Table.HeadCell className="table-cell">SKU</Table.HeadCell>
            <Table.HeadCell className="table-cell">Price</Table.HeadCell>
            <Table.HeadCell className="table-cell">Quantity</Table.HeadCell>
            <Table.HeadCell className="table-cell">
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>

          {/* {!loader && ( */}
          <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
            {currentPageProducts.map((product) => {
              return (
                <TableItem
                  key={product.id}
                  product={product}
                  onWarningModalOpen={onWarningModalOpen}
                />
              )
            })}
          </Table.Body>
          {/* )} */}
        </Table>
        {loader && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${loaderBg} rounded-xl`}
          >
            <Loader />
          </div>
        )}
      </div>

      {/* <Pagination
        className="mt-8"
        currentPage={currentPage}
        onPageChange={(page) => {
          changeCurrentPage(page)
        }}
        totalPages={totalPages}
      /> */}

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
    </div>
  )
}

'use client'
import { tx } from '@/shared/i18n'
import { BackofficeAPI } from '@/services'

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import {
  useCategoryStore,
  useManufactureStore,
  useProductsStore,
} from '@/store/store'
import { Loader, ResponsiveTableWrapper } from '@/components/common'
import { PaginationData, ProductData } from '@/shared/types'

type ProductsTableType = {
  onWarningModalOpen: (product: ProductData) => void
}

// const S3_URL = process.env.S3_URL

export const ProductsTable: React.FC<ProductsTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)
  const filtersInitializedRef = useRef(false)

  const {
    currentPageProducts,
    currentPage,
    itemsPerPage,
    fetchProducts,
    changeCurrentPage,
    totalPages,
    count,
    resetProductsState,
    sortFiled,
    sortOrder,
  } = useProductsStore()

  useEffect(() => {
    if (!filtersInitializedRef.current) {
      // Only reset state if we don't have any existing data
      // This prevents resetting state when navigating back from edit page
      if (currentPageProducts.length === 0) {
        resetProductsState()
      }
      filtersInitializedRef.current = true
    }
  }, [resetProductsState, currentPageProducts.length])

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
  }, [currentPage, fetchProductsData, sortFiled, sortOrder])

  const { fetchAllCategories } = useCategoryStore()
  const { fetchAllManufactures } = useManufactureStore()
  useEffect(() => {
    fetchAllCategories()
    fetchAllManufactures()
  }, [fetchAllCategories, fetchAllManufactures])

  const [costs, setCosts] = useState<Record<string, number>>({})
  useEffect(() => {
    if (currentPageProducts.length === 0) return
    BackofficeAPI.getProductCosts(currentPageProducts.map((p) => p.id)).then(
      (data) => setCosts(data ?? {})
    )
  }, [currentPageProducts])

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  return (
    <ResponsiveTableWrapper
      tableOnPhone
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => changeCurrentPage(page)}
      count={count}
    >
      <div className="table-container relative">
        <div className="table-body-container ">
          <Table className="w-full max-md:min-w-[1150px]">
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell w-44">
                {tx("Status")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/4">{tx("Name")}</Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">
                {tx("Category")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">
                {tx("Manufacturer")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">
                {tx("Internal code / SKU")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                {tx("Price")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                {tx("Purchase")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                {tx("Quantity")}
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                <span className="sr-only">{tx("Actions")}</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageProducts.map((product) => {
                return (
                  <TableItem
                    key={product.id}
                    product={product}
                    purchasePrice={costs[product.id]}
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

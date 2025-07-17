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
    currentPageProducts.length > 0 ? 'bg-black/30' : 'bg-transparent'

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
      <div className="overflow-x-auto relative min-h-[100px]">
        <Table>
          <Table.Head>
            {/* <Table.HeadCell /> */}
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Category</Table.HeadCell>
            <Table.HeadCell>manufacturer</Table.HeadCell>
            <Table.HeadCell>Sku</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Edit</span>
            </Table.HeadCell>
          </Table.Head>

          {/* {!loader && ( */}
          <Table.Body className="divide-y">
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
            className={`absolute inset-0 flex items-center justify-center ${loaderBg}`}
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

      <div className="flex justify-between gap-4 items-center w-full mt-8">
        <Pagination
          currentPage={currentPage}
          onPageChange={(page) => {
            changeCurrentPage(page)
          }}
          totalPages={totalPages}
        />

        <p className="text-gray-400 text-sm">
          Total: {totalPages * itemsPerPage}
        </p>
      </div>
    </div>
  )
}

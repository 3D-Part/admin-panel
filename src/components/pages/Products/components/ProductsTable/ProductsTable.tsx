'use client'

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import {
  useProductsStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, ProductData, ProductFormBody } from '@/shared/types'
import { HiDotsVertical } from 'react-icons/hi'
import { Dropdown } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import { toast } from 'react-toastify'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type ProductsTableType = {
  onWarningModalOpen: (product: ProductData) => void
}

const S3_URL = process.env.S3_URL

export const ProductsTable: React.FC<ProductsTableType> = ({
  onWarningModalOpen,
}) => {
  const [loader, setLoader] = useState(true)
  const filtersInitializedRef = useRef(false)

  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  const {
    currentPageProducts,
    currentPage,
    itemsPerPage,
    fetchProducts,
    changeCurrentPage,
    totalPages,
    count,
    changeProductFilter,
    changeActiveProduct,
    addNewProducts,
    resetProductsState,
    sortFiled,
    sortOrder,
  } = useProductsStore()

  // Check if user has write permission for products
  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.PRODUCT_WRITE,
    currentUser?.role
  )

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

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1)
    }
  }, [changeCurrentPage, currentPage, totalPages])

  // Mobile card actions component
  const MobileCardActions = ({ product }: { product: ProductData }) => {
    const router = useRouter()
    const {
      changeIsAddProductsOnSaleModalOpen,
      changeIsRemoveProductsFromSaleModalOpen,
    } = useUISliceStore()
    const {
      changeActiveProduct,
      addNewProducts,
      currentPage,
      itemsPerPage,
      fetchProducts,
    } = useProductsStore()

    const addProductOnSale = () => {
      changeActiveProduct(product)
      changeIsAddProductsOnSaleModalOpen(true)
    }

    const removeProductFromSale = () => {
      changeActiveProduct(product)
      changeIsRemoveProductsFromSaleModalOpen(true)
    }

    const duplicateProduct = async () => {
      const _body: ProductFormBody = { ...product }
      _body.name = _body.name + ' copy'
      if (!product.manufacturer) {
        delete _body.manufacturerId
      }
      if (!product.description) {
        delete _body.description
      }
      if (!product.details) {
        delete _body.details
      }
      const request = await addNewProducts(_body)
      if (request) {
        toast(`${product.name} is copied!`, {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
        })
        fetchProductsData()
      }
    }

    const editProduct = () => {
      // Only allow edit if user has write permission
      if (!hasWritePermission) {
        return
      }
      changeActiveProduct(product)
      router.push(URLPartsEnum.EditProduct)
    }

    return (
      <div
        className="flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {hasWritePermission && (
          <Dropdown
            inline
            arrowIcon={false}
            label={
              <HiDotsVertical className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200" />
            }
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <Dropdown.Item
              onClick={editProduct}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium table-action-link cursor-pointer">
                Edit
              </span>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={duplicateProduct}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium table-action-link cursor-pointer">
                Duplicate
              </span>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={
                product.productOnSale.length > 0
                  ? removeProductFromSale
                  : addProductOnSale
              }
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium table-action-link cursor-pointer">
                {product.productOnSale.length > 0
                  ? 'Remove from sale'
                  : 'Add on sale'}
              </span>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onWarningModalOpen(product)}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium table-action-danger cursor-pointer">
                Remove
              </span>
            </Dropdown.Item>
          </Dropdown>
        )}
      </div>
    )
  }

  // Generate mobile cards
  const mobileCards = currentPageProducts.map((product) => {
    const { name, category, manufacturer, sku, price, quantity, images } =
      product
    const mainImage = images.find((image) => image.isMain) || images[0]
    const activeImageId = mainImage ? `${S3_URL}/${mainImage.imageId}` : ''

    const editProduct = () => {
      // Only allow edit if user has write permission
      if (!hasWritePermission) {
        return
      }
      changeActiveProduct(product)
      router.push(URLPartsEnum.EditProduct)
    }

    return (
      <MobileCardBuilder
        key={product.id}
        title={name}
        subtitle={sku}
        onClick={hasWritePermission ? editProduct : undefined}
        items={[
          {
            label: 'Category',
            value: category ? (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {category.name}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
          {
            label: 'Manufacturer',
            value: manufacturer ? (
              <span className="text-gray-700 dark:text-gray-300">
                {manufacturer.name}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            ),
          },
          {
            label: 'Price',
            value: (
              <span className="font-semibold text-green-600 dark:text-green-400">
                {price} KM
              </span>
            ),
          },
          {
            label: 'Quantity',
            value: (
              <span
                className={`font-medium ${
                  quantity > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {quantity}
              </span>
            ),
          },
        ]}
        actions={<MobileCardActions product={product} />}
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
      <div className="table-container relative">
        <div className="table-body-container ">
          <Table className="w-full">
            <Table.Head className="table-header">
              <Table.HeadCell className="table-cell w-1/3">Name</Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">
                Category
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">
                Manufacturer
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/6">SKU</Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                Price
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                Quantity
              </Table.HeadCell>
              <Table.HeadCell className="table-cell w-1/12">
                <span className="sr-only">Actions</span>
              </Table.HeadCell>
            </Table.Head>
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

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

// const S3_URL = process.env.S3_URL

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
    changeActiveProduct,
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

  // Mobile card actions component
  const MobileCardActions = ({ product }: { product: ProductData }) => {
    const router = useRouter()
    const {
      changeIsAddProductsOnSaleModalOpen,
      changeIsRemoveProductsFromSaleModalOpen,
    } = useUISliceStore()
    const { changeActiveProduct, addNewProducts } = useProductsStore()

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
                {tx("Edit")}
              </span>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={duplicateProduct}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium table-action-link cursor-pointer">
                {tx("Duplicate")}
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
                  ? tx("Remove from sale")
                  : tx("Add on sale")}
              </span>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onWarningModalOpen(product)}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium table-action-danger cursor-pointer">
                {tx("Remove")}
              </span>
            </Dropdown.Item>
          </Dropdown>
        )}
      </div>
    )
  }

  // Generate mobile cards
  const mobileCards = currentPageProducts.map((product) => {
    const { name, category, manufacturer, sku, code, price, quantity, images } =
      product
    const mainImage = images.find((image) => image.isMain) || images[0]
    // const activeImageId = mainImage ? `${S3_URL}/${mainImage.imageId}` : ''

    const editProduct = () => {
      // Only allow edit if user has write permission
      if (!hasWritePermission) {
        return
      }
      changeActiveProduct(product)
      router.push(URLPartsEnum.EditProduct)
    }

    // on phones one compact row per product; a tap opens it, the menu stays on the right
    return (
      <div
        key={product.id}
        role={hasWritePermission ? 'button' : undefined}
        onClick={hasWritePermission ? editProduct : undefined}
        className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0 active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-800"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {name}
            {!product.isPublished && (
              <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {tx('Not published')}
              </span>
            )}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {code ? `${code} · ${sku}` : sku}
            {category ? ` · ${category.name}` : ''}
            {manufacturer ? ` · ${manufacturer.name}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">{price} KM</span>
          <span
            className={`text-xs font-medium ${
              quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {tx('Stock')}: {quantity}
          </span>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <MobileCardActions product={product} />
        </div>
      </div>
    )
  })

  return (
    <ResponsiveTableWrapper
      mobileCards={
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          {mobileCards}
        </div>
      }
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => changeCurrentPage(page)}
      count={count}
    >
      <div className="table-container relative">
        <div className="table-body-container ">
          <Table className="w-full">
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

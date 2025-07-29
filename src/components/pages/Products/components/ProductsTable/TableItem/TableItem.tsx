import { URLPartsEnum } from '@/shared/enums'

import { PaginationData, ProductData, ProductFormBody } from '@/shared/types'
import {
  useProductsStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import { Avatar, Dropdown, Table } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { HiDotsVertical } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type TableItemType = {
  product: ProductData
  onWarningModalOpen: (product: ProductData) => void
}

const S3_URL = process.env.S3_URL

export const TableItem: React.FC<TableItemType> = ({
  product,
  onWarningModalOpen,
}) => {
  const [activeImageId, setActiveImageId] = useState('')
  const { name, category, manufacturer, sku, price, quantity, images } = product

  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  const { changeIsAddProductsOnSaleModalOpen } = useUISliceStore()

  const {
    changeActiveProduct,
    addNewProducts,
    currentPage,
    itemsPerPage,
    fetchProducts,
  } = useProductsStore()

  // Check if user has write permission for products
  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.PRODUCT_WRITE,
    currentUser?.role
  )

  const addProductOnSale = () => {
    changeActiveProduct(product)
    changeIsAddProductsOnSaleModalOpen(true)
  }

  // Make this function global
  const fetchProductsData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchProducts(paginationData)
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

  useEffect(() => {
    if (images.length === 0) return

    const mainImage = images.find((image) => image.isMain)
    const _activeImageId = mainImage ? mainImage.imageId : images[0].imageId
    setActiveImageId(`${S3_URL}/${_activeImageId}`)
  }, [images])

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell
          onClick={hasWritePermission ? editProduct : undefined}
          className={`whitespace-nowrap font-medium table-cell w-1/3 ${
            hasWritePermission ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex justify-start items-center gap-4">
            <Avatar
              alt="product"
              placeholderInitials="3D"
              img={activeImageId}
              size="md"
              rounded
              className="rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700"
            />
            <span
              title={name}
              className="flex-1 font-semibold text-gray-900 dark:text-white overflow-hidden truncate"
            >
              {name}
            </span>
          </div>
        </Table.Cell>
        <Table.Cell className="table-cell w-1/6">
          {category ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {category.name}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">—</span>
          )}
        </Table.Cell>
        <Table.Cell className="table-cell w-1/6">
          {manufacturer ? (
            <span className="text-gray-700 dark:text-gray-300">
              {manufacturer.name}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">—</span>
          )}
        </Table.Cell>
        <Table.Cell className="table-cell w-1/6">
          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
            {sku}
          </span>
        </Table.Cell>
        <Table.Cell className="table-cell w-1/12">
          <span className="font-semibold text-green-600 dark:text-green-400">
            {price} KM
          </span>
        </Table.Cell>
        <Table.Cell className="table-cell w-1/12">
          <span
            className={`font-medium ${
              quantity > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {quantity}
          </span>
        </Table.Cell>
        <Table.Cell className="table-cell w-1/12">
          {hasWritePermission && (
            <div className="flex justify-end items-center">
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
                  onClick={addProductOnSale}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="font-medium table-action-link cursor-pointer">
                    Add on sale
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
            </div>
          )}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

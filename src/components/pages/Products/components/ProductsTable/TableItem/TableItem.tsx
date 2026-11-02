import { URLPartsEnum } from '@/shared/enums'

import { PaginationData, ProductData, ProductFormBody } from '@/shared/types'
import {
  useCategoryStore,
  useManufactureStore,
  useProductsStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import { Avatar, Badge, Dropdown, Select, Table, ToggleSwitch } from 'flowbite-react'
import { BackofficeAPI, ProductsAPI } from '@/services'
import { InlineNumber, InlineText } from '@/components/common'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { HiDotsVertical } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type TableItemType = {
  product: ProductData
  purchasePrice?: number
  onWarningModalOpen: (product: ProductData) => void
}

const S3_URL = process.env.S3_URL

export const TableItem: React.FC<TableItemType> = ({
  product,
  purchasePrice,
  onWarningModalOpen,
}) => {
  const [activeImageId, setActiveImageId] = useState('')
  const { name, category, manufacturer, sku, code, price, quantity, images } =
    product

  const router = useRouter()
  const { currentUser } = useCurrentUserStore()
  const { allCategories: categories } = useCategoryStore()
  const { allManufactures: manufacturers } = useManufactureStore()
  const [published, setPublished] = useState(Boolean(product.isPublished))

  const saveField = async (body: Record<string, unknown>) =>
    Boolean(await ProductsAPI.editProducts(product.id, body as any))

  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [manufacturerId, setManufacturerId] = useState(product.manufacturerId ?? '')

  useEffect(() => {
    setCategoryId(product.categoryId)
    setManufacturerId(product.manufacturerId ?? '')
    setPublished(Boolean(product.isPublished))
  }, [product])

  const saveSelect = async (
    field: string,
    value: string,
    previous: string,
    setValue: (value: string) => void
  ) => {
    setValue(value)
    if (await saveField({ [field]: value })) {
      toast('Saved', { type: 'success', autoClose: 1500 })
    } else {
      setValue(previous)
    }
  }

  const togglePublished = async (value: boolean) => {
    setPublished(value)
    if (!(await saveField({ isPublished: value }))) setPublished(!value)
  }

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

  const removeProductFromSale = () => {
    changeActiveProduct(product)
    changeIsRemoveProductsFromSaleModalOpen(true)
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
        <Table.Cell className="table-cell w-44 whitespace-nowrap">
          <div className="flex flex-col items-start gap-1">
            <ToggleSwitch
              disabled={!hasWritePermission}
              checked={published}
              label={published ? 'Published' : 'Hidden'}
              onChange={togglePublished}
            />
            {product.productOnSale.length > 0 && (
              <Badge color="failure" className="w-fit">
                On sale
              </Badge>
            )}
          </div>
        </Table.Cell>
        <Table.Cell className="font-medium table-cell w-1/4">
          <div className="flex justify-start items-center gap-3 min-w-[220px]">
            <button
              type="button"
              aria-label={`Open ${name}`}
              onClick={hasWritePermission ? editProduct : undefined}
            >
              <Avatar
                alt="product"
                placeholderInitials="3D"
                img={activeImageId}
                size="md"
                rounded
                className="rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700"
              />
            </button>
            <InlineText
              label={`Name of ${name}`}
              value={name}
              editable={hasWritePermission}
              onSave={(value) => saveField({ name: value })}
            />
          </div>
        </Table.Cell>
        <Table.Cell className="table-cell w-1/6">
          {hasWritePermission ? (
            <Select
              sizing="sm"
              aria-label={`Category of ${name}`}
              value={categoryId}
              onChange={(e) => saveSelect('categoryId', e.target.value, categoryId, setCategoryId)}
            >
              {!categories.some((c) => c.id === categoryId) && category && (
                <option value={categoryId}>{category.name}</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          ) : (
            category?.name ?? '—'
          )}
        </Table.Cell>
        <Table.Cell className="table-cell w-1/6">
          {hasWritePermission ? (
            <Select
              sizing="sm"
              aria-label={`Manufacturer of ${name}`}
              value={manufacturerId}
              onChange={(e) =>
                e.target.value &&
                saveSelect('manufacturerId', e.target.value, manufacturerId, setManufacturerId)
              }
            >
              <option value="">—</option>
              {!manufacturers.some((m) => m.id === manufacturerId) && manufacturer && (
                <option value={manufacturerId}>{manufacturer.name}</option>
              )}
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          ) : (
            manufacturer?.name ?? '—'
          )}
        </Table.Cell>
        <Table.Cell className="table-cell w-1/6">
          {code && (
            <span className="block font-mono text-xs font-semibold text-gray-900 dark:text-white">
              {code}
            </span>
          )}
          <InlineText
            label={`SKU of ${name}`}
            value={sku}
            className="w-24"
            editable={hasWritePermission}
            onSave={(value) => saveField({ sku: value })}
          />
        </Table.Cell>
        <Table.Cell className="table-cell w-1/12">
          <InlineNumber
            label={`Price of ${name}`}
            value={price}
            editable={hasWritePermission}
            onSave={(value) => saveField({ price: value })}
          />
        </Table.Cell>
        <Table.Cell className="table-cell w-1/12">
          <InlineNumber
            label={`Purchase price of ${name}`}
            value={purchasePrice}
            placeholder="Add"
            editable={hasWritePermission}
            onSave={async (value) =>
              Boolean(await BackofficeAPI.setProductCost(product.id, value))
            }
          />
        </Table.Cell>
        <Table.Cell className="table-cell w-1/12">
          <InlineNumber
            label={`Quantity of ${name}`}
            value={quantity}
            whole
            editable={hasWritePermission}
            onSave={(value) => saveField({ quantity: value })}
          />
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
                {product.productOnSale.length > 0 && (
                  <Dropdown.Item
                    onClick={removeProductFromSale}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="font-medium table-action-link cursor-pointer">
                      Remove from sale
                    </span>
                  </Dropdown.Item>
                )}
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

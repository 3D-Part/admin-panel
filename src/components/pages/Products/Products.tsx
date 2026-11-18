'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { WarningModal } from '@/components/common'
import { useProductsStore, useSalesSliceStore } from '@/store/store'
import { toast } from 'react-toastify'
import { ProductsAPI } from '@/services'
import { PaginationData, ProductData } from '@/shared/types'
import { ProductsOverviewHeader } from './components/ProductsHeader/ProductsHeader'
import { ProductsTable } from './components/ProductsTable/ProductsTable'

export const Products = () => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)

  const {
    activeProduct,
    fetchProducts,
    changeActiveProduct,
    changeCurrentPage,
    changeProductFilter,
    currentPage,
    itemsPerPage,
    productFilters,
  } = useProductsStore()

  // Links from the analytics: /products?key=<name or code>, ?categoryId=,
  // ?manufacturerId=, with ?label= naming what the list is narrowed to.
  const params = useSearchParams()
  const router = useRouter()
  const linkKey = params.toString()
  const label = params.get('label')
  const [appliedLink, setAppliedLink] = useState('')

  useEffect(() => {
    const key = params.get('key')
    const categoryId = params.get('categoryId')
    const manufacturerId = params.get('manufacturerId')
    if (!key && !categoryId && !manufacturerId) {
      setAppliedLink('')
      // a narrowing left from an earlier link
      const left = (productFilters as { filters?: Record<string, unknown> })?.filters
      if (left?.categoryId || left?.manufacturerId) changeProductFilter({})
      return
    }
    changeProductFilter({
      ...(key && { key }),
      ...((categoryId || manufacturerId) && {
        filters: {
          ...(categoryId && { categoryId: { is: categoryId } }),
          ...(manufacturerId && { manufacturerId: { is: manufacturerId } }),
        },
      }),
    })
    changeCurrentPage(1)
    fetchProducts({ offset: 0, limit: itemsPerPage })
    // the search box reads its starting text once, so it is remounted
    setAppliedLink(linkKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkKey])

  const clearLink = () => {
    changeProductFilter({})
    changeCurrentPage(1)
    router.replace('/products')
    fetchProducts({ offset: 0, limit: itemsPerPage })
  }

  const { fetchAllSales } = useSalesSliceStore()

  useEffect(() => {
    fetchAllSales()
  }, [fetchAllSales])

  const fetchProductsData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchProducts(paginationData)
  }

  const onWarningModalConfirm = async () => {
    if (!activeProduct) {
      setIsWarningModalOpen(false)
      return
    }

    const response = await ProductsAPI.removeProducts(activeProduct.id)

    if (response) {
      const toastMessage = tx("product {name} is removed", { name: activeProduct.name })
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      fetchProductsData()
    }
    setIsWarningModalOpen(false)
  }

  const onWarningModalOpen = (product: ProductData) => {
    setIsWarningModalOpen(true)
    changeActiveProduct(product)
  }

  const onWarningModalClose = () => {
    setIsWarningModalOpen(false)
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {label && appliedLink && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {label}
          </span>
          <button type="button" onClick={clearLink} className="text-purple-700 hover:underline dark:text-purple-300">
            {tx('Clear filter')}
          </button>
        </div>
      )}
      <ProductsOverviewHeader key={appliedLink} />
      <ProductsTable onWarningModalOpen={onWarningModalOpen} />

      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={tx("Are you sure you want to delete {name}?", { name: activeProduct.name })}
      />
    </div>
  )
}

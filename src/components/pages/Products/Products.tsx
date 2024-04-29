'use client'

import React, { useEffect, useState } from 'react'
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
    currentPage,
    itemsPerPage,
  } = useProductsStore()

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
      const toastMessage = `product ${activeProduct.name} is removed`
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
    <div className="w-full">
      <ProductsOverviewHeader />
      <ProductsTable onWarningModalOpen={onWarningModalOpen} />

      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={`Are you sure you want to delete ${activeProduct.name}?`}
      />
    </div>
  )
}

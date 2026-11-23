'use client'
import ProductCodes from '@/components/common/ProductCodes/ProductCodes'
import { tx } from '@/shared/i18n'

import React, { useEffect } from 'react'
import { useProductsStore, useUISliceStore } from '@/store/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductsAPI } from '@/services'
import { URLPartsEnum } from '@/shared/enums'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { TabsMenu } from './components/TabsMenu/TabsMenu'

export const EditProduct = () => {
  const { activeProduct, changeActiveProduct } = useProductsStore()
  // /products/edit?id=… opens a product straight from a link (e.g. the product groups)
  const idFromLink = useSearchParams().get('id')

  const { changeIsAddProductsOnSaleModalOpen } = useUISliceStore()

  const addProductOnSale = () => {
    changeIsAddProductsOnSaleModalOpen(true)
  }

  const router = useRouter()

  useEffect(() => {
    if (idFromLink && activeProduct.id !== idFromLink) {
      ProductsAPI.getOneProduct(idFromLink).then((product) => {
        if (product) changeActiveProduct(product as any)
        else router.push(URLPartsEnum.Products)
      })
      return
    }
    if (activeProduct.id) return

    router.push(URLPartsEnum.Products)
  }, [activeProduct, router, idFromLink, changeActiveProduct])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 w-full flex-wrap flex justify-between gap-4 items-center mb-8">
        <div className="min-w-0">
          <h2 className="text-gray-900 dark:text-white text-4xl font-bold">
            {activeProduct.name}
          </h2>
          <ProductCodes block className="mt-1 text-sm" code={activeProduct.code} sku={activeProduct.sku} />
        </div>
        <div className="flex items-center gap-4">
          <Button color="purple" onClick={addProductOnSale}>
            {tx("Add on sale")}{' '}<HiPlus className="ml-2" />
          </Button>
          <Button href={URLPartsEnum.AddNewProduct}>
            {tx("Add new")}{' '}<HiPlus className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <TabsMenu />
      </div>
    </div>
  )
}
